package com.res.server.backend.entity;

import com.res.server.backend.entity.enums.AlertChannel;
import com.res.server.backend.entity.enums.AlertType;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "alerts",
        indexes = { // indexes for faster querying means when we search by library, student or scheduled date
        // we can find the records quickly
                @Index(name = "idx_alert_library", columnList = "library_id"),
                @Index(name = "idx_alert_student", columnList = "student_id"),
                @Index(name = "idx_alert_scheduled", columnList = "scheduled_for")
        })
@Getter @Setter
public class Alert extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_id", nullable = false)
    private Library library;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "alert_type", nullable = false)
    private AlertType type; // EXPIRY_SOON, EXPIRED

    private LocalDate scheduledFor;

    private Instant sentAt;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "alert_channel", nullable = false)
    private AlertChannel channel; // LOG, EMAIL, WHATSAPP

    @Column(columnDefinition = "jsonb") // use jsonb for better performance in postgres
    @JdbcTypeCode(SqlTypes.JSON) // store payload as json in db
    private String payload;
}