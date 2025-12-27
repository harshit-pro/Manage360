package com.res.server.backend.dto.response;
import com.res.server.backend.entity.enums.MembershipStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class MembershipRenewResponse {
    private UUID paymentId;
    private LocalDate activeUntil;
    private MembershipStatus status;
}