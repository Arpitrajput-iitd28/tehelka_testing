package com.load.Controller;

import com.load.Model.Report;
import com.load.Service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/{reportId}/download")
    public ResponseEntity<InputStreamResource> downloadExcelReport(@PathVariable Long reportId) {
        Report report = reportService.getReport(reportId);
        String excelPath = report.getHtmlReportContent(); // Path to the generated Excel file

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
}
