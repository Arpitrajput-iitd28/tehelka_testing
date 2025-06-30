package com.load.Model;



import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class LoadTestConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String testName;
    private String targetUrl;
    private int numUsers;
    private int rampUpPeriod;
    private int testDuration;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}