package com.res.server.backend.service;

import com.res.server.backend.dto.response.MembershipRenewResponse;
import com.res.server.backend.entity.enums.PaymentMethod;

import java.util.UUID;

public interface MembershipService {
    MembershipRenewResponse renew(UUID studentId, int months, int amount, PaymentMethod method, String note);

}
