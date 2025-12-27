package com.res.server.backend.controller;

import com.res.server.backend.dto.response.DashboardSummaryResponse;
import com.res.server.backend.dto.response.EstimatedFeesResponse;
import com.res.server.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER','STAFF')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummaryResponse summary(
            @RequestParam(defaultValue = "5") int dueInDays
    ) {
        return dashboardService.summary(dueInDays);
    }

    @GetMapping("/estimated-fees")
    public EstimatedFeesResponse estimatedFees() {
        return dashboardService.estimatedFees();
    }
}