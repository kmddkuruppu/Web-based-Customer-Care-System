package lk.sliit.backend.dto.ticket;

import jakarta.validation.constraints.NotNull;
import lk.sliit.backend.enums.TicketPriority;

public record PriorityRequest(@NotNull TicketPriority priority) {}
