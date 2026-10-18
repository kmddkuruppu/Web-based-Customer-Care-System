package lk.sliit.backend.service;

import lk.sliit.backend.dto.report.DashboardReportResponse;
import lk.sliit.backend.entity.CustomerFeedback;
import lk.sliit.backend.entity.Ticket;
import lk.sliit.backend.enums.TicketStatus;
import lk.sliit.backend.repository.CustomerFeedbackRepository;
import lk.sliit.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final TicketRepository ticketRepository;
    private final CustomerFeedbackRepository feedbackRepository;

    @Transactional(readOnly = true)
    public DashboardReportResponse dashboard() {
        List<Ticket> tickets = ticketRepository.findAll();
        List<CustomerFeedback> feedback = feedbackRepository.findAll();

        long total = tickets.size();
        long open = tickets.stream().filter(t -> t.getStatus() == TicketStatus.OPEN).count();
        long resolved = tickets.stream().filter(t -> t.getStatus() == TicketStatus.RESOLVED).count();
        long closed = tickets.stream().filter(t -> t.getStatus() == TicketStatus.CLOSED).count();
        long escalated = tickets.stream().filter(t -> t.getStatus() == TicketStatus.ESCALATED).count();

        double avgResolutionHours = tickets.stream()
                .filter(t -> t.getResolvedAt() != null)
                .mapToLong(t -> Duration.between(t.getCreatedAt(), t.getResolvedAt()).toMinutes())
                .average().orElse(0.0) / 60.0;

        double satisfaction = feedback.stream().mapToInt(CustomerFeedback::getRating).average().orElse(0.0);

        Map<String, Long> byCategory = tickets.stream().collect(Collectors.groupingBy(
                t -> t.getCategory().getName(), LinkedHashMap::new, Collectors.counting()));
        Map<String, Long> byPriority = tickets.stream().collect(Collectors.groupingBy(
                t -> t.getPriority().name(), LinkedHashMap::new, Collectors.counting()));
        Map<String, Long> workload = tickets.stream()
                .filter(t -> t.getAssignedAgent() != null && !t.isArchived())
                .collect(Collectors.groupingBy(t -> t.getAssignedAgent().getFullName(), LinkedHashMap::new, Collectors.counting()));

        return new DashboardReportResponse(total, open, resolved, closed, escalated,
                avgResolutionHours, satisfaction, byCategory, byPriority, workload);
    }
}
