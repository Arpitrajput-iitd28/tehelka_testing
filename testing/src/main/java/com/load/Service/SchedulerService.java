package com.load.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.load.Model.LoadTestConfig;
import com.load.Repository.LoadTestConfigRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SchedulerService {
    @Autowired
    private LoadTestConfigRepository configRepository;
    @Autowired
    private LoadTestExecutionService executionService;

    // Check every minute
    @Scheduled(fixedRate = 60000)
    public void checkScheduledTests() {
        LocalDateTime now = LocalDateTime.now();
        List<LoadTestConfig> scheduledTests = configRepository
            .findByScheduledAndScheduledExecutionTimeBefore(true, now);
        scheduledTests.forEach(config -> {
            executionService.executeTest(config.getId());
            // Optionally, mark as executed or update status
            config.setScheduled(false);
            configRepository.save(config);
        });
    }
}
