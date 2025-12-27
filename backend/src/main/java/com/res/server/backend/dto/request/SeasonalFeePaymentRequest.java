package com.res.server.backend.dto.request;

import com.res.server.backend.entity.enums.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter
public class SeasonalFeePaymentRequest {
    @NotNull
    private UUID studentId;

    @Min(1)
    private int amount;

    @NotNull
    private PaymentMethod method;

    private String note;
    private String referenceId;
}

