package com.res.server.backend.service;

import com.res.server.backend.dto.response.DashboardSummaryResponse;
import com.res.server.backend.dto.response.EstimatedFeesResponse;

public interface DashboardService {
    DashboardSummaryResponse summary(int dueInDays);
    EstimatedFeesResponse estimatedFees();
}