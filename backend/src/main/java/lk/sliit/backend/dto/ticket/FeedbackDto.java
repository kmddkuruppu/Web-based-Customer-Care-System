package lk.sliit.backend.dto.ticket;

import java.time.LocalDateTime;

public record FeedbackDto(Long id, Integer rating, String comment, LocalDateTime createdAt) {}
