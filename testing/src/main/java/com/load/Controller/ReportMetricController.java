package com.load.Controller;

import java.util.DoubleSummaryStatistics;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.load.Service.ReportMetricService;
import com.load.Model.ReportMetric;

@RestController
@RequestMapping("/api/reports/{reportId}/metrics")

public class ReportMetricController {

    private final ReportMetricService reportMetricService;

    public ReportMetricController(ReportMetricService reportMetricService) {
        this.reportMetricService = reportMetricService;
    }

    @GetMapping
    public ResponseEntity<List<ReportMetric>> getAllMetricsForReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(reportMetricService.getMetricsForReport(reportId));
    }

    @GetMapping("/by-label")
    public ResponseEntity<List<ReportMetric>> getMetricsByLabel(
            @PathVariable Long reportId,
            @RequestParam String label) {
        return ResponseEntity.ok(reportMetricService.getMetricsByLabel(reportId, label));
    }

    @GetMapping("/by-error")
    public ResponseEntity<List<ReportMetric>> getMetricsByErrorThreshold(
            @PathVariable Long reportId,
            @RequestParam double maxErrorPct) {
        return ResponseEntity.ok(reportMetricService.getMetricsByErrorThreshold(reportId, maxErrorPct));
    }

    @GetMapping("/summary/average")
    public ResponseEntity<DoubleSummaryStatistics> getSummaryStatsForAverage(@PathVariable Long reportId) {
        return reportMetricService.getSummaryStatsForAverage(reportId)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/{metricId}")
    public ResponseEntity<ReportMetric> getMetricById(@PathVariable Long metricId) {
        return ResponseEntity.ok(reportMetricService.getMetricById(metricId));
    }
}
