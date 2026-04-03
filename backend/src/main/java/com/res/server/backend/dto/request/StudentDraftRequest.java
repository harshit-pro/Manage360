package com.res.server.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class StudentDraftRequest {
    @NotBlank
    private String name;
    private String mobileNo;
    private String seatNo;
    private LocalDate dateOfVisit;
    private String notes;
}
