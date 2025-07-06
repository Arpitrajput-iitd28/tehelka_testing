package com.load.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "report_metric")
public class ReportMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(name = "label")
    private String label; // e.g., request name

    @Column(name = "samples")
    private Integer samples;

    @Column(name = "average")
    private Double average;

    @Column(name = "min")
    private Double min;

    @Column(name = "max")
    private Double max;

    @Column(name = "std_dev")
    private Double stdDev;

    @Column(name = "error_pct")
    private Double errorPct;

    @Column(name = "throughput")
    private Double throughput;

    @Column(name = "received_kb_sec")
    private Double receivedKbSec;

    @Column(name = "sent_kb_sec")
    private Double sentKbSec;
}

