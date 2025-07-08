package com.load.Model;

import java.time.LocalDateTime;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;


@Getter@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "run_test")
public class RunTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;



    @Column(name = "result_file_path")
    private String resultFilePath;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "error_message")
    private String errorMessage;

}


