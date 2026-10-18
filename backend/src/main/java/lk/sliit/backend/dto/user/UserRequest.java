package lk.sliit.backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lk.sliit.backend.enums.UserRole;

public record UserRequest(
        @NotBlank @Size(min = 3, max = 120) String fullName,
        @NotBlank @Email String email,
        @Size(max = 30) String contactNumber,
        @Size(max = 500) String address,
        UserRole role,
        @Size(min = 6, max = 100) String password
) {}
