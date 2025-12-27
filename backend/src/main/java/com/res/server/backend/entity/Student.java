package com.res.server.backend.entity;

import com.res.server.backend.entity.enums.GENDER;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "students",
        uniqueConstraints = @UniqueConstraint(columnNames = {"library_id", "reg_no"})
)
// explain above
// This annotation defines a unique constraint on the combination of library_id and reg_no
// columns in the students table. This ensures that within a given library, each
// registration number (reg_no) is unique, preventing duplicate entries for the same
// student in that library.
@Getter
@Setter
public class Student extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Membership membership;

    @ManyToOne(fetch = FetchType.LAZY) // many students can belong to one library
    @JoinColumn(name = "library_id")
    private Library library; // foreign key to library

    @Column(name = "reg_no", nullable = false, unique = true)
    private String regNo; // registration number of student
    private String name;
    private String aadharNo;
    private String seatNo;
    private LocalDate dateOfJoining;
    private String mobileNo;
    private String guardianName;
    private String guardianMobile;

    @Enumerated(EnumType.STRING)
    private GENDER gender;

    private String address;
    private Integer seasonalFees;
    private Integer feesDeposited = 0;
    private Boolean isEnrolled = true;
}
