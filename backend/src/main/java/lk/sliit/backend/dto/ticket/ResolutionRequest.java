package lk.sliit.backend.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResolutionRequest(@NotBlank @Size(min = 5, max = 5000) String resolution) {}
