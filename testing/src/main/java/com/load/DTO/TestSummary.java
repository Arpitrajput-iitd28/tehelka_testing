package com.load.DTO;

import java.time.LocalDateTime;

import com.load.Enums.TestRunStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
@Getter
@AllArgsConstructor
public class TestSummary {
    private long id;
    private String testName;
    private LocalDateTime createdAt;
    private TestRunStatus testRunStatus;
    
}
