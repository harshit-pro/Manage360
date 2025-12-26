package com.res.server.backend.repository;

import com.res.server.backend.entity.Payment;
import com.res.server.backend.entity.enums.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Page<Payment> findByLibrary_IdAndStudent_Id(
            UUID libraryId,
            UUID studentId,
            Pageable pageable
    );

    Page<Payment> findByLibrary_IdAndTypeAndPaidAtBetween(
            UUID libraryId,
            PaymentType type,
            Instant from,
            Instant to,
            Pageable pageable
    );
    // Used for generating reports page is used for pagination means we can fetch data in chunks
    // instead of fetching all data at once which can be memory intensive
}