package com.load.Controller;

import com.load.DTO.ReportResultDTO;
import com.load.Model.Report;
import com.load.Service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // 1. Download Excel for a specific report
    @GetMapping("/{reportId}/download")
    public ResponseEntity<InputStreamResource> downloadExcelReport(@PathVariable Long reportId) {
        Report report = reportService.getReport(reportId);
        String excelPath = report.getHtmlReportContent();

        if (excelPath == null || !(new File(excelPath).exists())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        try {
            File file = new File(excelPath);
            InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("report-" + reportId + ".xlsx")
                    .build());
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(file.length())
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 2. Get summary of all reports for a project
    @GetMapping("/project/{projectId}/summaries")
    public ResponseEntity<List<ReportResultDTO>> getReportSummariesForProject(@PathVariable Long projectId) {
        List<Report> reports = reportService.getReportsForProject(projectId);
        List<ReportResultDTO> summaries = reports.stream()
                .map(r -> new ReportResultDTO(r.getId(), r.getHtmlReportContent()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(summaries);
    }
}
