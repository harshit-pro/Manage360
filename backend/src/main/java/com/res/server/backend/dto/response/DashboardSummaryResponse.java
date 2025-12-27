package com.res.server.backend.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long totalStudents;
    private long activeStudents;
    private long expiredMemberships;
    private long dueMemberships;
    private int pendingFeesAmount;
    private int totalRevenue;
    private Map<String, Integer> revenueByMethod;
}