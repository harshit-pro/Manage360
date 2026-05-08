package com.res.server.backend.repository;

import com.res.server.backend.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SeatRepository extends JpaRepository<Seat, UUID> {
    List<Seat> findByLibrary_IdOrderByRowNoAscColNoAsc(UUID libraryId);

    Optional<Seat> findByIdAndLibrary_Id(UUID id, UUID libraryId);
}

