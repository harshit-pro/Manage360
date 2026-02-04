package com.res.server.backend.repository;


import com.res.server.backend.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface StudentRepository
        extends JpaRepository<Student, UUID>, JpaSpecificationExecutor<Student> {
//    JpaSpecificationExecutor → dynamic filters
//	•	Library isolation enforced at repository level
//	•	Prevents seat/regNo collisions inside a library
    Optional<Student> findByIdAndLibrary_Id(UUID id, UUID libraryId);

    boolean existsByLibrary_IdAndSeatNo(UUID libraryId, String seatNo);

    boolean existsByLibrary_IdAndRegNo(UUID libraryId, String regNo);

    long countByLibrary_Id(UUID libraryId);

    long countByLibrary_IdAndIsEnrolledTrue(UUID libraryId);

    @Query("""
select coalesce(sum(s.seasonalFees - s.feesDeposited), 0)
from Student s
where s.library.id = :libraryId
and s.isEnrolled = true
and s.feesDeposited < s.seasonalFees
""") //it sums up the pending fees for all enrolled students in a specific library
    // coalesce → handles null values by returning 0 instead of null
    int totalPendingFees(UUID libraryId);


    @Query("""
select coalesce(sum(s.seasonalFees), 0),
       coalesce(sum(s.feesDeposited), 0)
from Student s
where s.library.id = :libraryId
and s.isEnrolled = true
""")
    Object estimatedVsCollected(UUID libraryId);

    @Query("""
    select s from Student s
    where s.library.id = :libraryId
      and (:isEnrolled is null or s.isEnrolled = :isEnrolled)
      and (
           :q is null or
           lower(s.name) like lower(concat('%', :q, '%')) or
           lower(s.regNo) like lower(concat('%', :q, '%')) or
           lower(cast(s.seatNo as string)) like lower(concat('%', :q, '%')) or
           lower(s.mobileNo) like lower(concat('%', :q, '%'))
      )
""")
    Page<Student> searchByLibrary(
            @Param("libraryId") UUID libraryId,
            @Param("q") String q,
            @Param("isEnrolled") Boolean isEnrolled,
            Pageable pageable
    );

}