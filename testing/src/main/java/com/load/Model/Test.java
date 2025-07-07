package com.load.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.load.Enums.Action;
import com.load.Enums.Thread;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "test")
public class Test {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name="test_name", nullable=false)
    private String testName;

    @Column(name="file_name", nullable=false)
    private String fileName;

    @Column(name = "jmx_file_data", nullable=false)
    private byte[] jmxFileData;

    // Load test configuration fields
    @Column (name="comments")
    private String comments;

    @Column(name="action")
    private Action action;

    @Column(name="thread_group")
    private Thread thread;

    @Column(name = "num_users")
    private Integer numUsers;

    @Column(name = "ramp_up_period")
    private Integer rampUpPeriod;

    @Column(name = "test_duration")
    private Integer testDuration;

    @Column(name= "loop_count")
    private Integer loop;

    @Column (name="startup_delay")
    private Integer startdelay;

    @Column(name = "startup_time")
    private Integer startupTime;

    @Column(name = "hold_load_for")
    private Integer holdLoadFor;

    @Column(name = "shutdown_time")
    private Integer shutdownTime;

    @Column(name = "start_thread_count")
    private Integer startThreadCount;

    @Column(name = "initial_delay")
    private Integer initialDelay;

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
}
