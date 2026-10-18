package lk.sliit.backend.dto.user;

import lk.sliit.backend.enums.UserRole;

public record UserResponse(Long id, String fullName, String email, String contactNumber, String address, UserRole role, boolean enabled) {}
