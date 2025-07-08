package com.load.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.load.Service.TestService;
import com.load.DTO.ScheduledSummary;

@RestController
@RequestMapping("/api/tests")

public class TopController {

    private final TestService testService;

    public TopController(TestService testService) {
        this.testService = testService;
    }

    @GetMapping("/scheduled")
    public List<ScheduledSummary> getAllScheduledTests() {
        return testService.getAllScheduledTests();
    }

    @GetMapping("/completed")
    public List<ScheduledSummary> getAllCompletedTests() {
        return testService.getAllScheduledTests();
    }

}