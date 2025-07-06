package com.load.Repository;



import com.load.Model.Test;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TestRepository extends JpaRepository<Test, Long> {
    List<Test> findByScheduledTrueAndScheduledExecutionTimeBefore(LocalDateTime time);
    List<Test> findByProjectId(Long projectId);
}

