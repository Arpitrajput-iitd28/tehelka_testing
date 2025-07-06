package com.load.DTO;

import java.time.LocalDateTime;

public class ProjectSummary {
    private String projectName;
    private LocalDateTime createdAt;

    public ProjectSummary(String projectName, LocalDateTime createdAt) {
        this.projectName = projectName;
        this.createdAt = createdAt;
    }

    public String getProjectName() {
        return projectName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
