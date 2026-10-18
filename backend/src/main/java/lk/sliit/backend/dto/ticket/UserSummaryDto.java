package lk.sliit.backend.dto.ticket;

import lk.sliit.backend.enums.UserRole;

public record UserSummaryDto(Long id, String fullName, String email, UserRole role) {}
