package com.res.server.backend.service;

import com.res.server.backend.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface StudentService {

    Student create(Student student);

    Student getById(UUID id);

    Page<Student> search(
            UUID libraryId,
            String q,
            Boolean isEnrolled,
            Pageable pageable);

    Student updateEnrollment(UUID id, boolean isEnrolled);

    Student update(UUID id, com.res.server.backend.dto.request.StudentUpdateRequest request);

    boolean isSeatAvailable(String seatNo);

    Student changeSeat(UUID studentId, String newSeatNo);

    Student swapSeats(UUID studentId, String targetSeatNo);

    String getNextRegNo();

    Student updateProfileImage(UUID studentId, String imageUrl);

    // Page<StudentResponse> getAllStudents(Pageable pageable);
}