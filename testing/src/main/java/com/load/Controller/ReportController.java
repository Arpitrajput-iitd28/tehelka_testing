package com.load.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.load.Model.LoadTestConfig;
import com.load.Model.LoadTestReport;
import com.load.Repository.LoadTestConfigRepository;
import com.load.Repository.LoadTestReportRepository;
import com.load.Service.ReportService;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;


@RestController
@RequestMapping("/api/load-test/report")
public class ReportController {

    @Autowired
    private LoadTestConfigRepository configRepository;
    @Autowired
    private LoadTestReportRepository reportRepository;
    @Autowired
    private ReportService reportService;

    @GetMapping("/history")
    public List<LoadTestReport> getHistory() {
        return reportRepository.findByScheduledFalseOrderByScheduledExecutionTimeDesc();
    }




    @GetMapping("/{configId}/json")
    public ResponseEntity<String> getJsonReport(@PathVariable Long configId) {
        LoadTestConfig config = configRepository.findById(configId)
            .orElseThrow(() -> new RuntimeException("Config not found: " + configId));
        LoadTestReport report = reportRepository.findByConfigId(configId)
            .orElseThrow(() -> new RuntimeException("Report not found for config: " + configId));
        String jsonReport = reportService.getJsonReport(report, config);
        return ResponseEntity.ok(jsonReport);
    }

    @GetMapping("/{configId}/pdf")
    public ResponseEntity<Resource> downloadPdfReport(@PathVariable Long configId) {
        LoadTestReport report = reportRepository.findByConfigId(configId)
            .orElseThrow(() -> new RuntimeException("Report not found for config: " + configId));
        Resource fileResource = new FileSystemResource(report.getPdfPath());
        if (!fileResource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=report_" + configId + ".pdf")
            .body(fileResource);
    }
}
