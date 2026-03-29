package com.res.server.backend.service;

import com.res.server.backend.dto.request.CreateExpenseRequest;

import java.util.UUID;

public interface ExpenseService {

    UUID createExpense(CreateExpenseRequest request);
}

