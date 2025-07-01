package com.load.Service;

import com.load.Model.LoadTestConfig;
import com.load.Repository.LoadTestConfigRepository;

import com.load.Model.CrudType; // Import your CrudType enum
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;


import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import java.io.FileOutputStream;


import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

@Service
public class LoadTestExecutionService {

    @Autowired
    private LoadTestConfigRepository configRepository;

    @Autowired
    private FileStorageService fileStorageService;



    @Autowired
    private ReportService reportService;



    public void generatePdfReport(String reportText, String pdfPath) throws Exception {
        Document document = new Document();
        PdfWriter.getInstance(document, new FileOutputStream(pdfPath));
        document.open();
        document.add(new Paragraph(reportText));
        document.close();
    }


    public void executeTest(Long configId) {
        LoadTestConfig config = configRepository.findById(configId)
            .orElseThrow(() -> new RuntimeException("Config not found: " + configId));
        runCustomLoadTest(config);
    }

    private void runCustomLoadTest(LoadTestConfig config) {
        int numUsers = config.getNumUsers();
        int durationSec = config.getTestDuration();
        String targetUrl = config.getTargetUrl();
        CrudType crudType = config.getCrudType(); // Get CRUD type from config
        String fileName = config.getFileName(); // This is the uploaded file's name

        final String requestBody;
        if (config.getCrudType() == CrudType.CREATE || config.getCrudType() == CrudType.UPDATE) {
            try {
                Path filePath = Paths.get("uploads").resolve(fileName);
                requestBody = fileStorageService.readFileContent(filePath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to read request body file", e);
            }
        } else {
            requestBody = null;
        }

    
            // Thread-safe metrics collection
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger errorCount = new AtomicInteger(0);
            Map<Integer, Integer> statusCodes = new ConcurrentHashMap<>();
    
            ExecutorService executor = Executors.newFixedThreadPool(numUsers);
            long startTime = System.currentTimeMillis();
            long endTime = startTime + (durationSec * 1000);
    
            // Reusable HTTP client (thread-safe)
            HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    
            try {
                for (int i = 0; i < numUsers; i++) {
                    executor.submit(() -> {
                        while (System.currentTimeMillis() < endTime) {
                            try {
                                // Build request dynamically based on CRUD type
                                HttpRequest request = buildHttpRequest(targetUrl, crudType, requestBody);
                            
                            // Send actual HTTP request
                            HttpResponse<String> response = client.send(
                                request, 
                                HttpResponse.BodyHandlers.ofString()
                            );
                            
                            // Track metrics
                            int statusCode = response.statusCode();
                            successCount.incrementAndGet();
                            statusCodes.merge(statusCode, 1, Integer::sum);
                        } catch (Exception e) {
                            errorCount.incrementAndGet();
                        }
                    }
                });
            }

            executor.shutdown();
            executor.awaitTermination(durationSec + 5, TimeUnit.SECONDS);
            generateReport(config, successCount.get(), errorCount.get(), statusCodes);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Load test interrupted", e);
        }
    }

    

    // Helper method to build HTTP request based on CRUD type
    private HttpRequest buildHttpRequest(String url, CrudType crudType, String requestBody) {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(Duration.ofSeconds(10))
            .header("Content-Type", "application/json");

        switch (crudType) {
            case CREATE:
                builder.POST(HttpRequest.BodyPublishers.ofString(requestBody != null ? requestBody : ""));
                break;
            case READ:
                builder.GET();
                break;
            case UPDATE:
                builder.PUT(HttpRequest.BodyPublishers.ofString(requestBody != null ? requestBody : ""));
                break;
            case DELETE:
                builder.DELETE();
                break;
            default:
                throw new IllegalArgumentException("Unsupported CRUD type: " + crudType);
        }

        return builder.build();
    }
    private void generateReport(LoadTestConfig config, int successCount, int errorCount, Map<Integer, Integer> statusCodes) {
        reportService.generateAndSaveReport(config, successCount, errorCount, statusCodes);
    }

}