package com.load.Repository;



import com.load.Model.LoadTestConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoadTestConfigRepository extends JpaRepository<LoadTestConfig, Long> {
}

