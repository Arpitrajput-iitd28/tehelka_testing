package com.load.Controller;



import com.load.Service.LoadTestConfigService;
import com.load.DTO.LoadTestConfigRequest;
import com.load.Model.LoadTestConfig;
import com.load.Repository.LoadTestConfigRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/load-tests")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class LoadTestConfigController {

    private LoadTestConfigRepository loadTestConfigRepository;

    private final LoadTestConfigService loadTestConfigService;

    public LoadTestConfigController(LoadTestConfigService loadTestConfigService, LoadTestConfigRepository loadTestConfigRepository) {
        this.loadTestConfigService = loadTestConfigService;
        this.loadTestConfigRepository= loadTestConfigRepository;
    }   

    @PostMapping("/config")
    public ResponseEntity<LoadTestConfig> createLoadTestConfig(@RequestBody LoadTestConfigRequest request) {
        LoadTestConfig config = loadTestConfigService.createConfig(request);
        return ResponseEntity.ok(config);
    }


    @GetMapping("/scheduled-tests")
    public List<LoadTestConfig> getAllScheduledTests() {
        return loadTestConfigRepository.findByScheduledTrueOrderByScheduledExecutionTimeAsc();
    }

}
