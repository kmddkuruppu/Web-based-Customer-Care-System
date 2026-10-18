package lk.sliit.backend.dto.ticket;

import java.time.LocalDateTime;

public record InternalNoteDto(Long id, String note, UserSummaryDto createdBy, LocalDateTime createdAt) {}
