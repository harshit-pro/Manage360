package com.res.server.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "seats",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"library_id", "seat_number"})
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Seat extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "seat_number", nullable = false)
    private String seatNumber;

    @Column(name = "row_no", nullable = false)
    private int rowNo;

    @Column(name = "col_no", nullable = false)
    private int colNo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "library_id", nullable = false)
    private Library library;
}
