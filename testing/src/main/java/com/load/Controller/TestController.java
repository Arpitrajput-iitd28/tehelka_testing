package com.load.Controller;

import com.load.DTO.TestRequest;
import com.load.DTO.TestSummary;
import com.load.Model.Test;
import com.load.Service.TestService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{projectId}/tests")

public class TestController {

    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    // 1. Get all tests for a project
    @GetMapping
public ResponseEntity<List<TestSummary>> getAllTestSummaries(@PathVariable Long projectId) {
    List<Test> tests = testService.getTestsByProjectId(projectId);
    List<TestSummary> summaries = tests.stream()
            .map(t -> new TestSummary(t.getId(),t.getTestName(), t.getCreatedAt(),t.getTestRunStatus()))
            .collect(Collectors.toList());
    return ResponseEntity.ok(summaries);
}

    // 2. Get a test by ID
    @GetMapping("/{testId}")
    public ResponseEntity<Test> getTest(@PathVariable Long testId) {
        Test test = testService.getTest(testId);
        return ResponseEntity.ok(test);
    }

    // 3. Delete a test
    @DeleteMapping("/{testId}")
    public ResponseEntity<Void> deleteTest(@PathVariable Long testId) {
        testService.deleteTest(testId);
        return ResponseEntity.noContent().build();
    }

    // 4. Create a test under a project
    @PostMapping(value = "/create", consumes = "multipart/form-data")
    public ResponseEntity<Test> createTest(
            @PathVariable Long projectId,
            @RequestPart("test") TestRequest request,
            @RequestPart("file") MultipartFile file) {

        System.out.println("TEST = " + request);
        System.out.println("FILE = " + file.getOriginalFilename());

        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            Test test = testService.createTest(projectId, request, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(test);
        } catch (Exception e) {
            e.printStackTrace(); // Log full error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
}
