package com.res.server.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "student_drafts")
@Getter
@Setter
public class StudentDraft extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_id")
    private Library library;

    private String name;
    private String mobileNo;
    private String seatNo;
    private LocalDate dateOfVisit;
    private String notes;
}
