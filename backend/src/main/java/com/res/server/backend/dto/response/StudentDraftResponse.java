package com.res.server.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class StudentDraftResponse {
    private UUID id;
    private String name;
    private String mobileNo;
    private String seatNo;
    private LocalDate dateOfVisit;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
