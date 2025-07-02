package com.load.Service;



import com.load.DTO.LoadTestConfigRequest;
import com.load.Model.LoadTestConfig;
import com.load.Repository.LoadTestConfigRepository;
import org.springframework.stereotype.Service;

@Service
public class LoadTestConfigService {

    private final LoadTestConfigRepository loadTestConfigRepository;

    public LoadTestConfigService(LoadTestConfigRepository loadTestConfigRepository) {
        this.loadTestConfigRepository = loadTestConfigRepository;
    }

    public LoadTestConfig createConfig(LoadTestConfigRequest request) {
        LoadTestConfig config = new LoadTestConfig();
        
        config.setTargetUrl(request.getTargetUrl());
        config.setNumUsers(request.getNumUsers());
        config.setRampUpPeriod(request.getRampUpPeriod());
        config.setTestDuration(request.getTestDuration());
        config.setScheduledExecutionTime(request.getScheduledExecutionTime());
        
        return loadTestConfigRepository.save(config);
    }
}
