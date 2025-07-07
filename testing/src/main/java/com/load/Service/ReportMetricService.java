package com.load.Service;

import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.load.Repository.ReportMetricRepository;
import com.load.Model.ReportMetric;

@Service
public class ReportMetricService {

    private final ReportMetricRepository reportMetricRepository;

    public ReportMetricService(ReportMetricRepository reportMetricRepository) {
        this.reportMetricRepository = reportMetricRepository;
    }

    public List<ReportMetric> getMetricsForReport(Long reportId) {
        return reportMetricRepository.findByReportId(reportId);
    }

    public List<ReportMetric> getMetricsByLabel(Long reportId, String label) {
        return reportMetricRepository.findByReportId(reportId).stream()
            .filter(m -> m.getLabel() != null && m.getLabel().equalsIgnoreCase(label))
            .toList();
    }

    public List<ReportMetric> getMetricsByErrorThreshold(Long reportId, double maxErrorPct) {
        return reportMetricRepository.findByReportId(reportId).stream()
            .filter(m -> m.getErrorPct() != null && m.getErrorPct() <= maxErrorPct)
            .toList();
    }

    public Optional<DoubleSummaryStatistics> getSummaryStatsForAverage(Long reportId) {
        List<ReportMetric> metrics = reportMetricRepository.findByReportId(reportId);
        return metrics.isEmpty() ? Optional.empty() :
            Optional.of(metrics.stream()
                .filter(m -> m.getAverage() != null)
                .mapToDouble(ReportMetric::getAverage)
                .summaryStatistics());
    }

    public ReportMetric getMetricById(Long metricId) {
        return reportMetricRepository.findById(metricId)
            .orElseThrow(() -> new RuntimeException("Metric not found with id: " + metricId));
    }
}

