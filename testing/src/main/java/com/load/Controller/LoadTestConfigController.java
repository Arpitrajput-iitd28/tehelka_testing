package com.load.Controller;



import com.load.Service.LoadTestConfigService;
import com.load.Model.LoadTestConfig;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/load-tests")
public class LoadTestConfigController {

    private final LoadTestConfigService loadTestConfigService;

    public LoadTestConfigController(LoadTestConfigService loadTestConfigService) {
        this.loadTestConfigService = loadTestConfigService;
    }

    @PostMapping("/config")
    public ResponseEntity<LoadTestConfig> createLoadTestConfig(@RequestBody LoadTestConfigRequest request) {
        LoadTestConfig config = loadTestConfigService.createConfig(request);
        return ResponseEntity.ok(config);
    }
}
