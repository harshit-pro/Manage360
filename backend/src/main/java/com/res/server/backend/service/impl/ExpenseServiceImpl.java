package com.res.server.backend.service.impl;

import com.res.server.backend.dto.request.CreateExpenseRequest;
import com.res.server.backend.dto.response.ExpenseResponse;
import com.res.server.backend.entity.Expense;
import com.res.server.backend.entity.Library;
import com.res.server.backend.repository.ExpenseRepository;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.service.ExpenseService;
import com.res.server.backend.service.context.LibraryContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final LibraryRepository libraryRepository;

    @Override
    @Transactional
    public UUID createExpense(CreateExpenseRequest request) {
        UUID libraryId = LibraryContext.getLibraryId();
        if (libraryId == null) {
            throw new IllegalStateException("Library context is not set");
        }

        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalStateException("Library not found"));

        Expense expense = new Expense();
        expense.setLibrary(library);
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setNote(request.getNote());
        expense.setSpentAt(request.getSpentAt() != null ? request.getSpentAt() : LocalDate.now());

        Expense saved = expenseRepository.save(expense);
        return saved.getId();
    }

    @Override
    public List<ExpenseResponse> getRecentExpenses() {
        UUID libraryId = LibraryContext.getLibraryId();
        if (libraryId == null) {
            return List.of();
        }

        return expenseRepository.findByLibrary_IdOrderBySpentAtDesc(libraryId).stream()
                .map(e -> new ExpenseResponse(
                        e.getId(),
                        e.getAmount().doubleValue(),
                        e.getCategory(),
                        e.getNote(),
                        e.getSpentAt()
                ))
                .collect(Collectors.toList());
    }
}

