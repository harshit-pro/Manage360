package com.res.server.backend.dto.response;

import com.res.server.backend.entity.enums.PaymentMethod;
import com.res.server.backend.entity.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class MonthlyPaymentItemResponse {

    private UUID paymentId;
    private PaymentType type;
    private PaymentMethod method;
    private int amount;
    private Instant paidAt;

    private LocalDate periodStart;
    private LocalDate periodEnd;

    private UUID studentId;
    private String studentName;
    private String regNo;
    private String seatNo;
    private LocalDate dateOfJoining;
    private String mobileNo;
}

