package com.load.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.load.Model.LoadTestReport;

public interface LoadTestReportRepository extends JpaRepository<LoadTestReport, Long> {
    Optional<LoadTestReport> findByConfigId(Long configId);
}

