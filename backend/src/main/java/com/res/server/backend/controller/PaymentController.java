package com.res.server.backend.controller;

import com.res.server.backend.dto.request.SeasonalFeePaymentRequest;
import com.res.server.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    @PostMapping("/seasonal")
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public Map<String, UUID> paySeasonal(@Valid @RequestBody SeasonalFeePaymentRequest req) {
        UUID id = paymentService.paySeasonalFee(
                req.getStudentId(), req.getAmount(), req.getMethod(), req.getNote(), req.getReferenceId()
        );
        return Map.of("paymentId", id);
    }
}