package com.load.DTO;

import com.load.Enums.Action;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import com.load.Enums.Thread;

@Getter
@Setter
public class TestRequest {
    private String testName;
    
    private String comments;
    private Action action;
    private Thread thread; // If you mean a custom type, replace with the correct class
    private Integer numUsers;
    private Integer rampUpPeriod;
    private Integer testDuration;
    private Integer loop;
    private Integer startdelay;
    private Integer startupTime;
    private Integer holdLoadFor;
    private Integer shutdownTime;
    private Integer startThreadCount;
    private Integer initialDelay;
    private LocalDateTime scheduledExecutionTime;
}
