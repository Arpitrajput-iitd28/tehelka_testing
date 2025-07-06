package com.load.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.load.Model.ReportMetric;

public interface ReportMetricRepository extends JpaRepository<ReportMetric, Long> {
    List<ReportMetric> findByReportId(Long reportId);
}
