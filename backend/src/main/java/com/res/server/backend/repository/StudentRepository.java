package com.res.server.backend.repository;


import com.res.server.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

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
}