package lk.sliit.backend.dto.ticket;

import jakarta.validation.constraints.NotNull;

public record AssignmentRequest(@NotNull Long agentId) {}
