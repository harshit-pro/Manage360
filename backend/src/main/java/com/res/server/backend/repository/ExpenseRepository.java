package com.res.server.backend.repository;

import com.res.server.backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByLibrary_IdAndSpentAtBetween(
            UUID libraryId,
            LocalDate from,
            LocalDate to
    );
}

