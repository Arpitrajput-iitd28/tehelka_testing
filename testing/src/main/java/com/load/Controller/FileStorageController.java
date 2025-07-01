package com.load.Controller;



import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.load.Service.FileStorageService;



@RestController
@RequestMapping("/api/load-tests")
public class FileStorageController {

    private final FileStorageService fileStorageService;

    

    public FileStorageController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> handleFileUpload(@RequestParam("file") MultipartFile file) {
        try {
            String filePath = fileStorageService.store(file);
            
            return ResponseEntity.ok("File uploaded: " + filePath);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        }
    }
}
