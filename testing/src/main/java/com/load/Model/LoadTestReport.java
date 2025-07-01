package com.load.Model;

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

    @Lob
    private String statusCodesJson; // Store status code map as JSON

    private String pdfPath;

    // getters and setters
}
