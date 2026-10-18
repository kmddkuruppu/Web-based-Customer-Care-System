package lk.sliit.backend.controller;

import lk.sliit.backend.dto.report.DashboardReportResponse;
import lk.sliit.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('MANAGER')")
    public DashboardReportResponse dashboard() {
        return reportService.dashboard();
    }
}
