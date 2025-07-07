package com.load.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;


import com.load.Model.RunTest;
import com.load.Model.Test;

public interface RunTestRepository extends JpaRepository<RunTest, Long> {
    List<RunTest> findByTest(Test test);
    List<RunTest> findByTest_Id(Long testId);
}

