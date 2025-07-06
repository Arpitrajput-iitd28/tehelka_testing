package com.load.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.load.Model.RunTest;

public interface RunTestRepository extends JpaRepository<RunTest, Long> {
    List<RunTest> findByProjectId(Long projectId);
}

