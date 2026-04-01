package com.res.server.backend.service;

import com.res.server.backend.dto.request.CreateExpenseRequest;
import com.res.server.backend.dto.response.ExpenseResponse;

import java.util.List;
import java.util.UUID;

public interface ExpenseService {

    UUID createExpense(CreateExpenseRequest request);

    List<ExpenseResponse> getRecentExpenses();
}

