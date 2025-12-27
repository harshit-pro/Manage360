package com.res.server.backend.service;


import com.res.server.backend.entity.enums.PaymentMethod;

import java.util.UUID;

public interface PaymentService {
        UUID paySeasonalFee(UUID studentId, int amount, PaymentMethod method, String note, String referenceId);
    }
    // this is PaymentService interface with paySeasonalFee method
//it is used in PaymentController to handle seasonal fee payments
