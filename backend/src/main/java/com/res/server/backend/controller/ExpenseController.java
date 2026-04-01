package com.res.server.backend.controller;

import com.res.server.backend.dto.request.CreateExpenseRequest;
import com.res.server.backend.dto.response.ExpenseResponse;
import com.res.server.backend.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER','STAFF')")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public Map<String, UUID> create(@Valid @RequestBody CreateExpenseRequest request) {
        UUID id = expenseService.createExpense(request);
        return Map.of("expenseId", id);
    }

    @GetMapping
    public List<ExpenseResponse> list() {
        return expenseService.getRecentExpenses();
    }
}

