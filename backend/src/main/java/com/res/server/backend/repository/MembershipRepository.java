package com.res.server.backend.repository;

import com.res.server.backend.entity.Membership;
import com.res.server.backend.entity.enums.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MembershipRepository extends JpaRepository<Membership, UUID> {

    Optional<Membership> findByStudent_IdAndLibrary_Id(UUID studentId, UUID libraryId);

    List<Membership> findByLibrary_IdAndActiveUntilLessThanEqual(UUID libraryId, LocalDate date);

    List<Membership> findByLibrary_IdAndStatus(MembershipStatus status, UUID libraryId);

    long countByLibrary_IdAndStatus(UUID libraryId, MembershipStatus status);

    @Query("""
select count(m)
from Membership m
where m.library.id = :libraryId
and m.activeUntil <= :limit
""")
    long countDue(UUID libraryId, LocalDate limit);
}