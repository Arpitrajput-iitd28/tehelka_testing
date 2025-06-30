package com.load.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter


public class LoadTestConfigRequest {
    private String testName;
    private String targetUrl;
    private int numUsers;
    private int rampUpPeriod; // in seconds
    private int testDuration; // in seconds


}

