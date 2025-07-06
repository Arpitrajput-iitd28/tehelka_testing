package com.load.Controller;

import com.load.DTO.TestRequest;
import com.load.Model.Test;
import com.load.Service.TestService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/tests")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class TestController {

    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    // 1. Get all tests for a project
    @GetMapping
    public ResponseEntity<List<Test>> getAllTests(@PathVariable Long projectId) {
        List<Test> tests = testService.getTestsByProjectId(projectId);
        return ResponseEntity.ok(tests);
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
    @PostMapping("/create")
    public ResponseEntity<Test> createTest(
            @PathVariable Long projectId,
            @RequestPart("test") TestRequest request,
            @RequestPart("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            Test test = testService.createTest(projectId, request, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(test);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
