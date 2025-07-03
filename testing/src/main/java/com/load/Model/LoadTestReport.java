package com.load.Model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter

@Entity
public class LoadTestReport {
    @Id
    @GeneratedValue
    private Long id;

    private Long configId;
    private int successCount;
    private int errorCount;
    private boolean scheduled;
    private LocalDateTime scheduledExecutionTime;
    @Lob
    private String statusCodesJson; // Store status code map as JSON

    private String pdfPath;

    // getters and setters
}
