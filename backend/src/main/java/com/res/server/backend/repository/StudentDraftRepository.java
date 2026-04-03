package com.res.server.backend.repository;

import com.res.server.backend.entity.StudentDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentDraftRepository extends JpaRepository<StudentDraft, UUID> {
    List<StudentDraft> findAllByLibraryIdOrderByUpdatedAtDesc(UUID libraryId);
    java.util.Optional<StudentDraft> findByIdAndLibrary_Id(UUID id, UUID libraryId);
}
