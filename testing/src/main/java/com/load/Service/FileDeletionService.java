package com.load.Service;

import org.springframework.stereotype.Service;

import com.load.Repository.LoadTestConfigRepository;

import java.io.File;

@Service
public class FileDeletionService {

    private final LoadTestConfigRepository loadTestConfigRepository;
    private static final String UPLOAD_DIR = "uploads";

    public FileDeletionService(LoadTestConfigRepository loadTestConfigRepository) {
        this.loadTestConfigRepository = loadTestConfigRepository;
    }

    public boolean deleteFileById(Long id) {
        return loadTestConfigRepository.findById(id).map(config -> {
            // Delete the file from disk
            if (config.getFileName() != null) {
                File file = new File(UPLOAD_DIR, config.getFileName());
                if (file.exists()) file.delete();
            }
            // Delete the record from the database
            loadTestConfigRepository.deleteById(id);
            return true;
        }).orElse(false);
    }
}
