package com.res.server.backend.repository;

import com.res.server.backend.entity.SeatAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SeatAssignmentRepository extends JpaRepository<SeatAssignment, UUID> {
    boolean existsBySeat_IdAndBatch_IdAndLibrary_IdAndActiveTrue(UUID seatId, UUID batchId, UUID libraryId);

    boolean existsByStudent_IdAndBatch_IdAndLibrary_IdAndActiveTrue(UUID studentId, UUID batchId, UUID libraryId);

    Optional<SeatAssignment> findByIdAndLibrary_Id(UUID id, UUID libraryId);

    List<SeatAssignment> findByBatch_IdAndLibrary_IdAndActiveTrue(UUID batchId, UUID libraryId);

    @Query("""
            select sa
            from SeatAssignment sa
            join fetch sa.seat s
            join fetch sa.student st
            where sa.batch.id = :batchId
              and sa.library.id = :libraryId
              and sa.active = true
            """)
    List<SeatAssignment> findActiveAssignmentsForBatch(@Param("batchId") UUID batchId,
                                                       @Param("libraryId") UUID libraryId);
}

