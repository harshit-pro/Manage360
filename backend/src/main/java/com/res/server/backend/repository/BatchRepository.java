package com.res.server.backend.repository;

import com.res.server.backend.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BatchRepository extends JpaRepository<Batch, UUID> {
    List<Batch> findByLibrary_IdOrderByStartTimeAsc(UUID libraryId);

    Optional<Batch> findByIdAndLibrary_Id(UUID id, UUID libraryId);
}

