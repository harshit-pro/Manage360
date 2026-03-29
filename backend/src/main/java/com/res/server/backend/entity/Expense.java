package com.res.server.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@Getter
@Setter
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_id")
    private Library library;

    @Column(nullable = false)
    private Integer amount;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(length = 255)
    private String note;

    @Column(nullable = false)
    private LocalDate spentAt;
}

