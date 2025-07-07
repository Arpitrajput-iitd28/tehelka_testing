package com.load.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import jakarta.validation.constraints.Email;

@Getter@Setter
@AllArgsConstructor
@NoArgsConstructor

public class LoginRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
    
}

