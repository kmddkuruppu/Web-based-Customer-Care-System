package lk.sliit.backend.dto.ticket;

import java.time.LocalDateTime;

public record TicketHistoryDto(
        Long id,
        String action,
        String previousValue,
        String newValue,
        String details,
        UserSummaryDto performedBy,
        LocalDateTime createdAt
) {}
