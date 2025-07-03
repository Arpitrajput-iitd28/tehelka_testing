package com.load.Repository;



import com.load.Model.LoadTestConfig;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LoadTestConfigRepository extends JpaRepository<LoadTestConfig, Long> {
     List<LoadTestConfig> findByScheduledAndScheduledExecutionTimeBefore(boolean scheduled, LocalDateTime time);
     int countByFileName(String fileName);
}

