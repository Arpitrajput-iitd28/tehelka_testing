package com.load.Model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "report")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "test_run_id", nullable = false)
    private Long testRunId;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @Column(name = "summary_json", columnDefinition = "TEXT")
    private String summaryJson; // Stores summary metrics as JSON

    @Column(name = "details_json", columnDefinition = "TEXT")
    private String detailsJson; // Stores per-sample/request details as JSON

    @Column(name = "graphs_json", columnDefinition = "TEXT")
    private String graphsJson; // Stores graph data (series, pie chart, etc.) as JSON

    @Column(name = "html_report_path")
    private String htmlReportPath; // Path to generated HTML report (if any)
}

