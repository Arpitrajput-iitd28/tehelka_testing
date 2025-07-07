package com.load.DTO;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
@Getter
@AllArgsConstructor
public class TestSummary {
    private String testName;
    private LocalDateTime createdAt;

   
}
