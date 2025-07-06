package com.load.Controller;

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
    @PostMapping("/{projectId}")
    public ResponseEntity<String> runTest(@PathVariable Long projectId) {
        try {
            String resultPath = runTestService.runTest(projectId);
            return ResponseEntity.ok("JMeter test executed successfully. Results at: " + resultPath);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to run JMeter test: " + e.getMessage());
        }
    }
}

