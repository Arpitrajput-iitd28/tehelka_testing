package com.load.Model;

import java.time.LocalDateTime;

import com.load.Enums.TestRunStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

public class RunTest {
    @Entity
    @Table(name = "test_run")
    public class TestRun {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "project_id", nullable = false)
        private Test test;

        @Column(name = "status")
        @Enumerated(EnumType.STRING)
        private TestRunStatus status; // e.g., QUEUED, RUNNING, COMPLETED, FAILED

        @Column(name = "result_file_path")
        private String resultFilePath;

        @Column(name = "started_at")
        private LocalDateTime startedAt;

        @Column(name = "finished_at")
        private LocalDateTime finishedAt;

        @Column(name = "error_message")
        private String errorMessage;
    }

}
