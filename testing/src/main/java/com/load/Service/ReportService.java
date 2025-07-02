package com.load.Service;

import com.load.Model.LoadTestConfig;
import com.load.Model.LoadTestReport;
import com.load.Repository.LoadTestReportRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import java.io.FileOutputStream;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private LoadTestReportRepository reportRepository;

    public LoadTestReport generateAndSaveReport(LoadTestConfig config, int successCount, int errorCount, Map<Integer, Integer> statusCodes) {
        try {
            // Convert statusCodes map to JSON
            ObjectMapper mapper = new ObjectMapper();
            String statusCodesJson = mapper.writeValueAsString(statusCodes);

            // Generate PDF
            String pdfPath = "reports/report_" + config.getId() + ".pdf";
            generatePdf(config, successCount, errorCount, statusCodes, pdfPath);

            // Save report entity
            LoadTestReport report = new LoadTestReport();
            report.setConfigId(config.getId());
            report.setSuccessCount(successCount);
            report.setErrorCount(errorCount);
            report.setStatusCodesJson(statusCodesJson);
            report.setPdfPath(pdfPath);

            return reportRepository.save(report);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate and save report", e);
        }
    }

    private void generatePdf(LoadTestConfig config, int successCount, int errorCount, Map<Integer, Integer> statusCodes, String pdfPath) throws Exception {
        StringBuilder report = new StringBuilder();
        report.append("Load Test Report\n");
        report.append("================\n");
       
        report.append("Target URL: ").append(config.getTargetUrl()).append("\n");
        report.append("Users: ").append(config.getNumUsers()).append("\n");
        report.append("Duration (s): ").append(config.getTestDuration()).append("\n");
        report.append("Successful Requests: ").append(successCount).append("\n");
        report.append("Failed Requests: ").append(errorCount).append("\n");
        report.append("Status Code Distribution:\n");
        statusCodes.forEach((code, count) -> report.append("  ").append(code).append(": ").append(count).append("\n"));

        Document document = new Document();
        PdfWriter.getInstance(document, new FileOutputStream(pdfPath));
        document.open();
        document.add(new Paragraph(report.toString()));
        document.close();
    }

    public String getJsonReport(LoadTestReport report, LoadTestConfig config) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<Integer, Integer> statusCodes = mapper.readValue(report.getStatusCodesJson(), Map.class);

            // Build JSON (could use a DTO)
            StringBuilder json = new StringBuilder();
            json.append("{");
            
            json.append("\"targetUrl\":\"").append(config.getTargetUrl()).append("\",");
            json.append("\"users\":").append(config.getNumUsers()).append(",");
            json.append("\"duration\":").append(config.getTestDuration()).append(",");
            json.append("\"successfulRequests\":").append(report.getSuccessCount()).append(",");
            json.append("\"failedRequests\":").append(report.getErrorCount()).append(",");
            json.append("\"statusCodeDistribution\":{");
            statusCodes.forEach((code, count) -> json.append("\"").append(code).append("\":").append(count).append(","));
            if (!statusCodes.isEmpty()) json.deleteCharAt(json.length() - 1); // Remove last comma
            json.append("}}");
            return json.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JSON report", e);
        }
    }
}



