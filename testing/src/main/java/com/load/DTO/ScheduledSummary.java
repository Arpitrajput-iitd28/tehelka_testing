package com.load.DTO;

import java.time.LocalDateTime;

import lombok.*;
@Getter@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ScheduledSummary {
    private String projectName;
    private String testName;
    private LocalDateTime createdAt;
    private LocalDateTime scheduledExecutionTime;
}
