package com.res.server.backend.service;


import com.res.server.backend.dto.response.MonthlyPaymentItemResponse;
import com.res.server.backend.entity.enums.PaymentMethod;

import java.util.UUID;

public interface PaymentService {
    UUID paySeasonalFee(UUID studentId, int amount, PaymentMethod method, String note, String referenceId);

    MonthlyPaymentItemResponse getPaymentDetails(UUID paymentId);
}
