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

        config.setCrudType(request.getCrudType());
        config.setTargetUrl(request.getTargetUrl());
        config.setNumUsers(request.getNumUsers());
        config.setRampUpPeriod(request.getRampUpPeriod());
        config.setTestDuration(request.getTestDuration());
        config.setScheduledExecutionTime(request.getScheduledExecutionTime());
        config.setFileName(request.getRequestBodyFilePath());

        
        String filePath = request.getRequestBodyFilePath(); // e.g., "uploads/myfile.json"
        String baseName = filePath;
        if (baseName.contains("/")) baseName = baseName.substring(baseName.lastIndexOf('/') + 1);
        if (baseName.contains(".")) baseName = baseName.substring(0, baseName.lastIndexOf('.'));

        // Count previous runs for this file
        int count = loadTestConfigRepository.countByFileName(filePath);
        String testName = baseName + (count + 1);

        config.setTestName(testName);

    
        
        return loadTestConfigRepository.save(config);
    }
}
