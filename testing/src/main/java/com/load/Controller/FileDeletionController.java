package com.load.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.load.Service.FileDeletionService;

@RestController
@RequestMapping("/api/load-tests")
public class FileDeletionController {

    private final FileDeletionService fileDeletionService;

    public FileDeletionController(FileDeletionService fileDeletionService) {
        this.fileDeletionService = fileDeletionService;
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUploadedFile(@PathVariable Long id) {
        boolean deleted = fileDeletionService.deleteFileById(id);
        if (deleted) {
            return ResponseEntity.ok("File deleted successfully.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

