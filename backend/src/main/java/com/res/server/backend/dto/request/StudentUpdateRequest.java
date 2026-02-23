package com.res.server.backend.dto.request;

import com.res.server.backend.entity.enums.GENDER;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class StudentUpdateRequest {
    private String name;
    private String seatNo;
    private String mobileNo;
    private String address;
    private String aadharNo;
    private String guardianName;
    private String guardianMobile;
    private GENDER gender;
    private LocalDate dateOfJoining;
    private Integer seasonalFees;
}
