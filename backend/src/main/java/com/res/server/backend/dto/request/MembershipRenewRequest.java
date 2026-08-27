package com.res.server.backend.dto.request;

import com.res.server.backend.entity.enums.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class MembershipRenewRequest {
    @Min(0) // Support 0 months for clearing dues
    private int months;
    @Min(1) // Minimum amount should be 1
    private int amount;
    @NotNull
    private PaymentMethod method;
    private String note;
    private boolean resetValidity;
}