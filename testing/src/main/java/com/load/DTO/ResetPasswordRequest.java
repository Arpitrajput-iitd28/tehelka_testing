package com.load.DTO;

import lombok.*;

@Getter@Setter
@AllArgsConstructor
@NoArgsConstructor

public class ResetPasswordRequest {
    private String token;
    private String newPassword;
    // getters and setters
}
