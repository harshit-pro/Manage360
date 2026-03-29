package com.res.server.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MonthlyRevenueExpensePoint {

    private int year;
    private int month;
    private int revenue;
    private int expenses;
    /**
     * Human-friendly label such as "Jan 2026".
     */
    private String label;
}

