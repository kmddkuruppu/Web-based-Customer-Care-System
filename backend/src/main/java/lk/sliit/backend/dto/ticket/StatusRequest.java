package lk.sliit.backend.dto.ticket;

import jakarta.validation.constraints.NotNull;
import lk.sliit.backend.enums.TicketStatus;

public record StatusRequest(@NotNull TicketStatus status) {}
