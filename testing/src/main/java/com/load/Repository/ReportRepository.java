package com.load.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.load.Model.Report;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByProjectId(Long projectId);
    List<Report> findByTestRunId(Long testRunId);
}


