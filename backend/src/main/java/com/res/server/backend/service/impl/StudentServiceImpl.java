package com.res.server.backend.service.impl;


import com.res.server.backend.entity.Library;
import com.res.server.backend.entity.Membership;
import com.res.server.backend.entity.Student;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.repository.MembershipRepository;
import com.res.server.backend.repository.StudentRepository;
import com.res.server.backend.repository.spec.StudentSpecifications;
import com.res.server.backend.service.RegNoService;
import com.res.server.backend.service.StudentService;
import com.res.server.backend.entity.enums.MembershipStatus;

import com.res.server.backend.service.context.LibraryContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentServiceImpl implements StudentService{

    private final StudentRepository studentRepository;
    private final MembershipRepository membershipRepository;
    private final LibraryRepository libraryRepository;
    private final RegNoService regNoService;

    @Override
    public Student create(Student student) {
        UUID libraryId = LibraryContext.getLibraryId();
        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalStateException("Library not found"));

        student.setLibrary(library);

        if (student.getRegNo() == null) {
            student.setRegNo(regNoService.generate());
        }

        Student saved = studentRepository.save(student);

        // Create default EXPIRED membership
        Membership membership = new Membership();
        membership.setLibrary(library);
        membership.setStudent(saved);
        membership.setActiveUntil(LocalDate.now().minusDays(1));
        membership.setStatus(MembershipStatus.EXPIRED);
        membershipRepository.save(membership);

        return saved;
    }

    @Override
    public Student getById(UUID id) {
        return studentRepository.findByIdAndLibrary_Id(id, LibraryContext.getLibraryId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
    }

    @Override
    public Page<Student> search(String q, Boolean isEnrolled, Pageable pageable) {
        return studentRepository.findAll(
                StudentSpecifications.belongsToLibrary(LibraryContext.getLibraryId())
                        .and(StudentSpecifications.isEnrolled(isEnrolled))
                        .and(StudentSpecifications.search(q)),
                pageable
        );
    }

    @Override
    public Student updateEnrollment(UUID id, boolean isEnrolled) {
        Student student = getById(id);
        student.setIsEnrolled(isEnrolled);
        return studentRepository.save(student);
    }
}