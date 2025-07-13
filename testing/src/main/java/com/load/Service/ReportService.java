package com.load.Service;

import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFDrawing;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFClientAnchor;
import org.apache.poi.xssf.usermodel.XSSFChart;
import org.apache.poi.xddf.usermodel.chart.*;
import org.springframework.stereotype.Service;

import com.load.Model.Report;
import com.load.Model.ReportMetric;
import com.load.Repository.ReportMetricRepository;
import com.load.Repository.ReportRepository;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final ReportMetricRepository reportMetricRepository;

    public ReportService(ReportRepository reportRepository, ReportMetricRepository reportMetricRepository) {
        this.reportRepository = reportRepository;
        this.reportMetricRepository = reportMetricRepository;
    }

    public Report createReport(Long projectId, Long testRunId, String summaryJson, String detailsJson, String graphsJson, String excelReportPath) {
        Report report = new Report();
        report.setProjectId(projectId);
        report.setTestRunId(testRunId);
        report.setGeneratedAt(LocalDateTime.now());
        report.setSummaryJson(summaryJson);
        report.setDetailsJson(detailsJson);
        report.setGraphsJson(graphsJson);
        report.setHtmlReportContent(excelReportPath); // Store Excel file path here
        return reportRepository.save(report);
    }

    public List<Report> getReportsForProject(Long projectId) {
        return reportRepository.findByProjectId(projectId);
    }

    public Report getReport(Long reportId) {
        return reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Report not found"));
    }

    public List<ReportMetric> getMetricsForReport(Long reportId) {
        return reportMetricRepository.findByReportId(reportId);
    }

    // Generate Excel report with summary, metrics, and graphs
    public String generateExcelReport(Long reportId, String summaryJson, String detailsJson, String graphsJson) throws Exception {
        List<ReportMetric> metrics = reportMetricRepository.findByReportId(reportId);
        
        Workbook workbook = new XSSFWorkbook();

        // 1. Summary Sheet
        Sheet summarySheet = workbook.createSheet("Summary");
        Row headerRow = summarySheet.createRow(0);
        headerRow.createCell(0).setCellValue("Metric");
        headerRow.createCell(1).setCellValue("Value");
        // Parse summaryJson and populate summarySheet as needed

        // 2. Metrics Sheet
        XSSFSheet metricsSheet = (XSSFSheet) workbook.createSheet("Metrics");
        Row metricsHeader = metricsSheet.createRow(0);
        metricsHeader.createCell(0).setCellValue("Label");
        metricsHeader.createCell(1).setCellValue("Samples");
        metricsHeader.createCell(2).setCellValue("Average");
        metricsHeader.createCell(3).setCellValue("Min");
        metricsHeader.createCell(4).setCellValue("Max");
        metricsHeader.createCell(5).setCellValue("Std Dev");
        metricsHeader.createCell(6).setCellValue("Error %");
        metricsHeader.createCell(7).setCellValue("Throughput");
        metricsHeader.createCell(8).setCellValue("Received KB/sec");
        metricsHeader.createCell(9).setCellValue("Sent KB/sec");

        int rowNum = 1;
        for (ReportMetric metric : metrics) {
            Row row = metricsSheet.createRow(rowNum++);
            row.createCell(0).setCellValue(metric.getLabel());
            row.createCell(1).setCellValue(metric.getSamples() != null ? metric.getSamples() : 0);
            row.createCell(2).setCellValue(metric.getAverage() != null ? metric.getAverage() : 0);
            row.createCell(3).setCellValue(metric.getMin() != null ? metric.getMin() : 0);
            row.createCell(4).setCellValue(metric.getMax() != null ? metric.getMax() : 0);
            row.createCell(5).setCellValue(metric.getStdDev() != null ? metric.getStdDev() : 0);
            row.createCell(6).setCellValue(metric.getErrorPct() != null ? metric.getErrorPct() : 0);
            row.createCell(7).setCellValue(metric.getThroughput() != null ? metric.getThroughput() : 0);
            row.createCell(8).setCellValue(metric.getReceivedKbSec() != null ? metric.getReceivedKbSec() : 0);
            row.createCell(9).setCellValue(metric.getSentKbSec() != null ? metric.getSentKbSec() : 0);
        }

        // 3. Graphs Sheet (example: error % pie chart)
        // Only create the chart if there is at least one data row
        Sheet graphSheet = workbook.createSheet("Graphs");
        if (rowNum > 1) {
            XSSFDrawing drawing = (XSSFDrawing) graphSheet.createDrawingPatriarch();
            XSSFClientAnchor anchor = drawing.createAnchor(0, 0, 0, 0, 0, 5, 10, 20);
            XSSFChart chart = drawing.createChart(anchor);

            // Set chart title
            chart.setTitleText("Error Percentage by Label");
            chart.setTitleOverlay(false);

            // Create legend
            XDDFChartLegend legend = chart.getOrAddLegend();
            legend.setPosition(LegendPosition.RIGHT);

            // Create data sources using XDDF
            XDDFDataSource<String> labels = XDDFDataSourcesFactory.fromStringCellRange(metricsSheet,
                    new CellRangeAddress(1, rowNum - 1, 0, 0));
            XDDFNumericalDataSource<Double> values = XDDFDataSourcesFactory.fromNumericCellRange(metricsSheet,
                    new CellRangeAddress(1, rowNum - 1, 6, 6));

            // Create pie chart data using the new XDDF method
            XDDFChartData data = chart.createData(ChartTypes.PIE, null, null);
            data.setVaryColors(true);
            data.addSeries(labels, values);
            chart.plot(data);
        } else {
            // Optionally, you can log or add a note to the sheet:
            Row noteRow = graphSheet.createRow(0);
            noteRow.createCell(0).setCellValue("No data available for chart.");
        }

        // Save Excel file to temp directory
        Path tempFile = Files.createTempFile("jmeter-report-", ".xlsx");
        try (FileOutputStream fos = new FileOutputStream(tempFile.toFile())) {
            workbook.write(fos);
        }
        workbook.close();

        return tempFile.toAbsolutePath().toString();
    }
}
