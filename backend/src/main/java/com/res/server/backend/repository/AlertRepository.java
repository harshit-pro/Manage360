package com.res.server.backend.repository;

import com.res.server.backend.entity.Alert;
import com.res.server.backend.entity.enums.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {

    boolean existsByLibrary_IdAndStudent_IdAndTypeAndScheduledFor(
            UUID libraryId,
            UUID studentId,
            AlertType type,
            LocalDate scheduledFor
    );

    List<Alert> findByLibrary_IdAndScheduledForLessThanEqual(UUID libraryId, LocalDate date);
}