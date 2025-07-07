package com.load.Model;



import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    // getters and setters
}

