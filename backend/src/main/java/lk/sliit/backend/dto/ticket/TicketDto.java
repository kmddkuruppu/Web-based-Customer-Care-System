package lk.sliit.backend.dto.ticket;

import lk.sliit.backend.dto.category.CategoryResponse;
import lk.sliit.backend.enums.TicketPriority;
import lk.sliit.backend.enums.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

public record TicketDto(
        Long id,
        String ticketId,
        String title,
        String description,
        CategoryResponse category,
        TicketPriority priority,
        TicketStatus status,
        UserSummaryDto customer,
        UserSummaryDto assignedAgent,
        String resolution,
        String escalationReason,
        String attachmentName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt,
        LocalDateTime closedAt,
        boolean archived,
        List<TicketResponseDto> responses,
        List<InternalNoteDto> notes,
        List<TicketHistoryDto> history,
        FeedbackDto feedback
) {}
