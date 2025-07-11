package com.load.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import jakarta.validation.constraints.Email;

@Getter@Setter
@AllArgsConstructor
@NoArgsConstructor

public class SignupRequest {
    @NotBlank
    private String name;
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String confirmPassword;
    
}


