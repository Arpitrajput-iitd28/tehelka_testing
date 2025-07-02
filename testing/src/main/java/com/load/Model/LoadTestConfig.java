package com.load.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@AllArgsConstructor
@Entity
@Table(name = "load_test_config")
public class LoadTestConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "target_url", nullable = false, length = 500)
    private String targetUrl;
    
    @Column(name = "num_users", nullable = false)
    private Integer numUsers;
    
    @Column(name = "ramp_up_period", nullable = false)
    private Integer rampUpPeriod;
    
    @Column(name = "test_duration", nullable = false)
    private Integer testDuration;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "crud_type", nullable = false)
    private CrudType crudType;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "scheduled")
    private Boolean scheduled = false;
    
    @Column(name = "scheduled_execution_time")
    private LocalDateTime scheduledExecutionTime;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors, getters, and setters
    public LoadTestConfig() {}
}
