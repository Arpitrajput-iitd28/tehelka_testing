package com.load.Controller;

import com.load.DTO.ReportResultDTO;
import com.load.Service.RunTestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/runtest")

public class RunTestController {

    private final RunTestService runTestService;

    public RunTestController(RunTestService runTestService) {
        this.runTestService = runTestService;
    }

    /**
     * Trigger a JMeter test run for the given project ID.
     * @param projectId The ID of the project to run.
     * @return The path to the JMeter result file or an error message.
     */
    @PostMapping("/{testId}")
    public ResponseEntity<ReportResultDTO> runTest(@PathVariable Long testId) {
        try {
            ReportResultDTO result = runTestService.runTest(testId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}

