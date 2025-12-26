package com.res.server.backend.entity;

import com.res.server.backend.entity.enums.AlertChannel;
import com.res.server.backend.entity.enums.AlertType;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "alerts")
@Getter @Setter
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_id")
    private Library library;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Enumerated(EnumType.STRING)
    private AlertType type;

    private LocalDate scheduledFor;
    private Instant sentAt;

    @Enumerated(EnumType.STRING)
    private AlertChannel channel;

    @Column(columnDefinition = "jsonb")
    private String payload;
}