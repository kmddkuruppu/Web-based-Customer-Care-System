package lk.sliit.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 120) String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 9, max = 30) String contactNumber,
        @NotBlank @Size(min = 5, max = 500) String address,
        @NotBlank @Size(min = 6, max = 100) String password
) {}
