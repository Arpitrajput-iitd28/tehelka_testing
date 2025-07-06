package com.load.Service;

import java.time.LocalDateTime;
import java.util.List;

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

    public Report createReport(Long projectId, Long testRunId, String summaryJson, String detailsJson, String graphsJson, String htmlReportPath) {
        Report report = new Report();
        report.setProjectId(projectId);
        report.setTestRunId(testRunId);
        report.setGeneratedAt(LocalDateTime.now());
        report.setSummaryJson(summaryJson);
        report.setDetailsJson(detailsJson);
        report.setGraphsJson(graphsJson);
        report.setHtmlReportPath(htmlReportPath);
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
}
