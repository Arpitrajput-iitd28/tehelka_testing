package com.load.Controller;



import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
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
    public ResponseEntity<Map<String, String>> handleFileUpload(
        @RequestParam("file") MultipartFile file,
        @RequestParam("customName") String customName) {
    try {
        String filePath = fileStorageService.store(file, customName);

        Map<String, String> response = new HashMap<>();
        response.put("customName", customName);
        response.put("filePath", filePath);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Failed to upload file: " + e.getMessage());
        return ResponseEntity.internalServerError().body(error);
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
                    String fileName = file.getName();
                
                String customName = fileName.contains(".") 
                    ? fileName.substring(0, fileName.lastIndexOf('.'))
                    : fileName;
                    fileList.add(new FileInfo(
                        customName,
                        file.length()
                       
                    ));
                }
            }
        }
        return ResponseEntity.ok(fileList);
    }

}
