package com.res.server.backend.service.impl;

import com.res.server.backend.dto.response.DashboardSummaryResponse;
import com.res.server.backend.dto.response.EstimatedFeesResponse;
import com.res.server.backend.dto.response.MonthlyRevenueExpensePoint;
import com.res.server.backend.entity.Library;
import com.res.server.backend.entity.Expense;
import com.res.server.backend.entity.Payment;
import com.res.server.backend.entity.enums.MembershipStatus;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.repository.ExpenseRepository;
import com.res.server.backend.repository.MembershipRepository;
import com.res.server.backend.repository.PaymentRepository;
import com.res.server.backend.repository.StudentRepository;
import com.res.server.backend.service.DashboardService;
import com.res.server.backend.service.context.LibraryContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final StudentRepository studentRepo;
    private final MembershipRepository membershipRepo;
    private final PaymentRepository paymentRepo;
    private final ExpenseRepository expenseRepository;
    private final LibraryRepository libraryRepo;

    @Override
    public DashboardSummaryResponse summary(int dueInDays) {

        UUID libraryId = LibraryContext.getLibraryId();
        LocalDate limit = LocalDate.now().plusDays(dueInDays);

        long totalStudents = studentRepo.countByLibrary_Id(libraryId);
        long activeStudents = studentRepo.countByLibrary_IdAndIsEnrolledTrue(libraryId);
        long expired = membershipRepo.countExpiredByDate(libraryId, LocalDate.now());
        long due = membershipRepo.countDue(libraryId, limit);
        int pendingFees = studentRepo.totalPendingFees(libraryId);
        int totalRevenue = paymentRepo.totalRevenue(libraryId);

        // Fetch total seats from library entity in DB
        int totalSeats = libraryRepo.findById(libraryId)
                .map(Library::getTotalSeats)
                .orElse(0);

        // Map<String, Integer> revenueByMethod = paymentRepo.revenueByMethod(libraryId)
        // .stream()
        // .collect(Collectors.toMap(
        // r -> r[0].toString(),
        // r -> ((Number) r[1]).intValue()
        // ));
        return new DashboardSummaryResponse(
                totalStudents,
                activeStudents,
                expired,
                due,
                pendingFees,
                totalRevenue,
                Map.of(), // revenueByMethod
                totalSeats);
    }

    @Override
    public EstimatedFeesResponse estimatedFees() {

        UUID libraryId = LibraryContext.getLibraryId();
        if (libraryId == null) {
            return new EstimatedFeesResponse(0, 0, 0);
        }

        Object result = studentRepo.estimatedVsCollected(libraryId);
        if (!(result instanceof Object[] row) || row.length < 2 || row[0] == null || row[1] == null) {
            return new EstimatedFeesResponse(0, 0, 0);
        }

        int estimated = ((Number) row[0]).intValue();
        int collected = ((Number) row[1]).intValue();

        return new EstimatedFeesResponse(
                estimated,
                collected,
                estimated - collected);
    }

    @Override
    public List<MonthlyRevenueExpensePoint> revenueExpenses(int months) {
        UUID libraryId = LibraryContext.getLibraryId();
        if (libraryId == null) {
            return List.of();
        }

        if (months <= 0) {
            months = 6;
        }

        LocalDate today = LocalDate.now();
        LocalDate fromDate = today.minusMonths(months - 1).withDayOfMonth(1);

        // Fetch payments and expenses once and then group by YearMonth in memory
        List<Payment> payments = paymentRepo.findByLibrary_IdAndPaidAtBetween(
                libraryId,
                fromDate.atStartOfDay().toInstant(java.time.ZoneOffset.UTC),
                today.plusDays(1).atStartOfDay().toInstant(java.time.ZoneOffset.UTC)
        );

        List<Expense> expenses = expenseRepository.findByLibrary_IdAndSpentAtBetween(
                libraryId,
                fromDate,
                today
        );

        Map<YearMonth, Integer> revenueByMonth = payments.stream()
                .collect(Collectors.groupingBy(
                        p -> YearMonth.from(p.getPaidAt().atZone(java.time.ZoneOffset.UTC)),
                        Collectors.summingInt(p -> Optional.ofNullable(p.getAmount()).orElse(0))
                ));

        Map<YearMonth, Integer> expensesByMonth = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> YearMonth.from(e.getSpentAt()),
                        Collectors.summingInt(e -> Optional.ofNullable(e.getAmount()).orElse(0))
                ));

        List<MonthlyRevenueExpensePoint> result = new ArrayList<>();
        YearMonth cursor = YearMonth.from(fromDate);
        YearMonth end = YearMonth.from(today);

        while (!cursor.isAfter(end)) {
            int revenue = revenueByMonth.getOrDefault(cursor, 0);
            int exp = expensesByMonth.getOrDefault(cursor, 0);
            String label = cursor.getMonth().name().substring(0, 3).charAt(0) +
                    cursor.getMonth().name().substring(1, 3).toLowerCase() +
                    " " + cursor.getYear();

            result.add(new MonthlyRevenueExpensePoint(
                    cursor.getYear(),
                    cursor.getMonthValue(),
                    revenue,
                    exp,
                    label
            ));
            cursor = cursor.plusMonths(1);
        }

        return result;
    }
}
