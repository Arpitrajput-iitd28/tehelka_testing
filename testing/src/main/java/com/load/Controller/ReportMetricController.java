package com.load.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.load.Model.ReportMetric;
import com.load.Service.ReportMetricService;

@RestController
@RequestMapping("/api/report-metrics")
public class ReportMetricController {
    private final ReportMetricService reportMetricService;

    @Autowired
    public ReportMetricController(ReportMetricService reportMetricService) {
        this.reportMetricService = reportMetricService;
    }

    @GetMapping("/{reportId}")
    public List<ReportMetric> getMetricsForReport(@PathVariable Long reportId) {
        return reportMetricService.getMetricsForReport(reportId);
    }

    @GetMapping("/{reportId}/by-label")
    public List<ReportMetric> getMetricsByLabel(@PathVariable Long reportId, @RequestParam String label) {
        return reportMetricService.getMetricsByLabel(reportId, label);
    }

    @GetMapping("/metric/{metricId}")
    public ReportMetric getMetricById(@PathVariable Long metricId) {
        return reportMetricService.getMetricById(metricId);
    }
}
