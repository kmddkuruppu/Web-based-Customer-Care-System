package lk.sliit.backend.dto.auth;

import lk.sliit.backend.enums.UserRole;

public record AuthResponse(String token, Long userId, String fullName, String email, UserRole role) {}
