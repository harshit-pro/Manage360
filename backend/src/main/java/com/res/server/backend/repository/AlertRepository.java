package com.res.server.backend.repository;

import com.res.server.backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {

    List<Alert> findByLibrary_IdAndScheduledForLessThanEqual(UUID libraryId, LocalDate date);
}