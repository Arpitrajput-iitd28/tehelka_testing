package com.load.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import com.load.Model.Report;



import com.load.Service.ReportService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:4200" , allowCredentials = "true")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/project/{projectId}")
    public List<Report> getReportsForProject(@PathVariable Long projectId) {
        return reportService.getReportsForProject(projectId);
    }

    @GetMapping("/{reportId}")
    public Report getReport(@PathVariable Long reportId) {
        return reportService.getReport(reportId);
    }

 
}
