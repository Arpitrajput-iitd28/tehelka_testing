package com.load.Service;

import com.load.DTO.TestRequest;
import com.load.Enums.TestRunStatus;
import com.load.Model.Project;
import com.load.Model.Test;
import com.load.Repository.ProjectRepository;
import com.load.Repository.TestRepository;
import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class TestService {

    private final TestRepository testRepository;
    private final ProjectRepository projectRepository;
    private final Set<String> allowedExtensions = new HashSet<>(Set.of("jmx", "pdf"));

    public TestService(TestRepository testRepository, ProjectRepository projectRepository) {
        this.testRepository = testRepository;
        this.projectRepository = projectRepository;
    }

    // Get all tests
    public List<Test> getAllTests() {
        return testRepository.findAll();
    }

    // Get all tests for a specific project
    public List<Test> getTestsByProjectId(Long projectId) {
        return testRepository.findByProjectId(projectId);
    }

    // Get a single test by ID
    public Test getTest(Long id) {
        return testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found with id: " + id));
    }

    // Delete a test by ID
    public void deleteTest(Long id) {
        if (!testRepository.existsById(id)) {
            throw new RuntimeException("Test not found with id: " + id);
        }
        testRepository.deleteById(id);
    }

    // Create a new test under a project
    public Test createTest(Long projectId, TestRequest request, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("A file is required for test creation.");
        }

        String extension = FilenameUtils.getExtension(file.getOriginalFilename()).toLowerCase();
        if (!allowedExtensions.contains(extension)) {
            throw new RuntimeException("File type not allowed: " + extension);
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        Test test = new Test();
        test.setProject(project);
        test.setTestName(request.getTestName());
        test.setComments(request.getComments());
        test.setAction(request.getAction());
        test.setThread(request.getThread());
        test.setNumUsers(request.getNumUsers());
        test.setRampUpPeriod(request.getRampUpPeriod());
        test.setTestDuration(request.getTestDuration());
        test.setLoop(request.getLoop());
        test.setStartdelay(request.getStartdelay());
        test.setStartupTime(request.getStartupTime());
        test.setHoldLoadFor(request.getHoldLoadFor());
        test.setShutdownTime(request.getShutdownTime());
        test.setStartThreadCount(request.getStartThreadCount());
        test.setInitialDelay(request.getInitialDelay());
        test.setScheduledExecutionTime(request.getScheduledExecutionTime());
        test.setTestRunStatus(TestRunStatus.SCHEDULED);

        test.setFileName(file.getOriginalFilename());
        test.setJmxFileData(file.getBytes());
        test.setCreatedAt(LocalDateTime.now());

        return testRepository.save(test);
    }
}
