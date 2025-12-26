package com.res.server.backend.service;

import com.res.server.backend.entity.Membership;

import java.util.UUID;

public interface MembershipService {
    Membership renew(UUID studentId, int months, int amount, String method, String note);

}
