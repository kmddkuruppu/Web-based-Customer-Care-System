package lk.sliit.backend.dto.ticket;

import lk.sliit.backend.enums.UserRole;

import java.time.LocalDateTime;

public record TicketResponseDto(Long id, UserSummaryDto sender, UserRole senderRole, String message, LocalDateTime createdAt) {}
