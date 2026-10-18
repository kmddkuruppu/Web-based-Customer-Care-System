package lk.sliit.backend.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EscalationRequest(@NotBlank @Size(min = 3, max = 1000) String reason) {}
