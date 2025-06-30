package com.load.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import java.util.Objects;

@Service
public class FileStorageService {
    private final Path uploadDir = Paths.get("uploads");

    public FileStorageService() throws IOException {
        Files.createDirectories(uploadDir);
    }

    public String store(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        Path destinationFile = uploadDir.resolve(
                Objects.requireNonNull(file.getOriginalFilename()));
        Files.copy(file.getInputStream(), destinationFile);
        return destinationFile.toString();
    }
}
