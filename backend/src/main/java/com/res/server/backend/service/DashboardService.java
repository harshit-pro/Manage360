package com.res.server.backend.service;

import com.res.server.backend.dto.response.DashboardSummaryResponse;
import com.res.server.backend.dto.response.EstimatedFeesResponse;
import com.res.server.backend.dto.response.MonthlyRevenueExpensePoint;

import java.util.List;

public interface DashboardService {
    DashboardSummaryResponse summary(int dueInDays);
    EstimatedFeesResponse estimatedFees();
    List<MonthlyRevenueExpensePoint> revenueExpenses(int months);
}
