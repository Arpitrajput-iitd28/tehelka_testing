package com.load.Controller;



import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.load.Service.FileStorageService;
import com.load.DTO.FileInfo;



@RestController
@RequestMapping("/api/load-tests")
public class FileStorageController {

    private final FileStorageService fileStorageService;
    
    private static final String UPLOAD_DIR = "uploads";

    

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

    @GetMapping("/uploads")
    public ResponseEntity<List<FileInfo>> listAllUploads() {
        File folder = new File(UPLOAD_DIR);
        File[] files = folder.listFiles();
        List<FileInfo> fileList = new ArrayList<>();

        if (files != null) {
            for (File file : files) {
                if (file.isFile()) {
                    fileList.add(new FileInfo(
                        file.getName(),
                        file.length()
                       
                    ));
                }
            }
        }
        return ResponseEntity.ok(fileList);
    }

}
