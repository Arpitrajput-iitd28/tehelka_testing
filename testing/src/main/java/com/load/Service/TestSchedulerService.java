package com.load.Service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.load.Model.Test;
import com.load.Repository.TestRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TestSchedulerService {

    private final TestRepository testRepository;
    private final RunTestService runTestService;

    public TestSchedulerService(TestRepository testRepository, RunTestService runTestService) {
        this.testRepository = testRepository;
        this.runTestService = runTestService;
    }

    // Runs every minute; adjust as needed
    @Scheduled(fixedRate = 60000)
    public void triggerScheduledTests() {
        LocalDateTime now = LocalDateTime.now();
        List<Test> testsToRun = testRepository.findByScheduledTrueAndScheduledExecutionTimeBefore(now);

        for (Test test : testsToRun) {
            try {
                runTestService.runTest(test.getId());
                test.setScheduled(false); // Mark as not scheduled after running
                testRepository.save(test);
            } catch (Exception e) {
                // Optionally log or handle errors
            }
        }
    }
}
