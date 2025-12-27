package com.res.server.backend.dto.request;


import com.res.server.backend.entity.enums.GENDER;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class StudentCreateRequest {

    @NotBlank
    private String name;

    private String aadharNo;
    private String seatNo;

    @NotNull
    private LocalDate dateOfJoining;

    @NotBlank
    private String mobileNo;

    private String guardianName;
    private String guardianMobile;

    @NotNull
    private GENDER gender;

    private String address;

    @NotNull
    @Positive
    private Integer seasonalFees;

    private Integer feesDeposited = 0;

    private Boolean isEnrolled = true;
}