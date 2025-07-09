package com.load.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter
@AllArgsConstructor
@NoArgsConstructor

public class ReportResultDTO {
    private Long reportId;
    private String excelReportPath;

    // Constructors, getters, setters
}
