package com.res.server.backend.controller;

import com.res.server.backend.dto.response.MonthlyPaymentItemResponse;
import com.res.server.backend.entity.Payment;
import com.res.server.backend.entity.Student;
import com.res.server.backend.entity.enums.PaymentType;
import com.res.server.backend.repository.PaymentRepository;
import com.res.server.backend.service.context.LibraryContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER','STAFF')")
public class ReportsController {

    private final PaymentRepository paymentRepository;

    @GetMapping("/monthly")
    public List<MonthlyPaymentItemResponse> monthly(
            @RequestParam int year,
            @RequestParam int month
    ) {
        UUID libraryId = LibraryContext.getLibraryId();
        if (libraryId == null) {
            return List.of();
        }

        YearMonth ym = YearMonth.of(year, month);
        Instant from = ym.atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant to = ym.plusMonths(1).atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<Payment> payments = paymentRepository.findMonthlyReportItems(
                libraryId,
                from,
                to,
                List.of(PaymentType.MEMBERSHIP_RENEWAL, PaymentType.SEASONAL_FEE)
        );

        return payments.stream().map(p -> {
            Student s = p.getStudent();
            return new MonthlyPaymentItemResponse(
                    p.getId(),
                    p.getType(),
                    p.getMethod(),
                    p.getAmount() != null ? p.getAmount() : 0,
                    p.getPaidAt(),
                    p.getPeriodStart(),
                    p.getPeriodEnd(),
                    s.getId(),
                    s.getName(),
                    s.getRegNo(),
                    s.getSeatNo(),
                    s.getDateOfJoining(),
                    s.getMobileNo(),
                    p.getNote()
            );
        }).toList();
    }
}

