package lk.sliit.backend.dto.report;

import java.util.Map;

public record DashboardReportResponse(
        long totalTickets,
        long openTickets,
        long resolvedTickets,
        long closedTickets,
        long escalatedTickets,
        double averageResolutionTime,
        double customerSatisfaction,
        Map<String, Long> ticketsByCategory,
        Map<String, Long> ticketsByPriority,
        Map<String, Long> agentWorkload
) {}
