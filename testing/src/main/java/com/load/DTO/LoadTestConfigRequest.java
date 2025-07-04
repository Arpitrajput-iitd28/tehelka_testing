package com.load.DTO;

import java.time.LocalDateTime;



import lombok.Getter;
import lombok.Setter;

@Getter@Setter


public class LoadTestConfigRequest {
    private String fileName;
    private String targetUrl;
    private int numUsers;
    private int rampUpPeriod; // in seconds
    private int testDuration; // in seconds
    private LocalDateTime scheduledExecutionTime;
    
}

