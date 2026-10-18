package lk.sliit.backend.dto.ticket;

import jakarta.validation.constraints.Size;
import lk.sliit.backend.enums.TicketPriority;

public record TicketUpdateRequest(
        @Size(min = 5, max = 180) String title,
        @Size(min = 10) String description,
        String category,
        TicketPriority priority
) {}
