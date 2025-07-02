package com.load.Service;


import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.io.FilenameUtils;
import org.springframework.util.StringUtils;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import java.util.Set;

@Service
public class FileStorageService {
    private final Path uploadDir;
    private final Set<String> allowedExtensions = Set.of("jmx", "txt", "json","zip", "tar", "gz", "sh","pdf" ); // Example allowed extensions
    private final long maxFileSize = 10 * 1024 * 1024; // 10 MB

    public FileStorageService() throws IOException {
        this.uploadDir = Paths.get("uploads");
        Files.createDirectories(uploadDir);
    }

    public String readFileContent(Path filePath) throws IOException {
        // filePath should be the full path returned by store()
        return Files.readString(filePath);
    }
    

    public String store(MultipartFile file, String customName) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("No selected file");
        }
    
        String extension = FilenameUtils.getExtension(file.getOriginalFilename()).toLowerCase();
        if (!allowedExtensions.contains(extension)) {
            throw new RuntimeException("File type not allowed");
        }
    
        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File size exceeds limit");
        }
    
        
        String filename = StringUtils.cleanPath(customName) + "." + extension;
        Path destinationFile = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), destinationFile);
        return destinationFile.toString();
    }
}
