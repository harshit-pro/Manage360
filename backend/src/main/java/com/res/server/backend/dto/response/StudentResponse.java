package com.res.server.backend.dto.response;

import com.res.server.backend.entity.enums.GENDER;
import com.res.server.backend.entity.enums.MembershipStatus;
import com.res.server.backend.entity.enums.PaymentMethod;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class StudentResponse {

    private UUID id;
    private String regNo;
    private String name;
    private String seatNo;
    private LocalDate dateOfJoining;
    private String mobileNo;
    private GENDER gender;
    private Integer seasonalFees;
    private Integer feesDeposited;
    private Boolean isEnrolled;

    private Membership membership;

    @Getter
    @Setter
    public static class Membership {
        private LocalDate activeUntil;
        private MembershipStatus status;
        private PaymentMethod lastPaymentMethod;
    }
}