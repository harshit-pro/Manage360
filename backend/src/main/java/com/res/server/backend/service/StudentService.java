package com.res.server.backend.service;


import com.res.server.backend.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface StudentService {

    Student create(Student student);

    Student getById(UUID id);

    Page<Student> search(String q, Boolean isEnrolled, Pageable pageable);

    Student updateEnrollment(UUID id, boolean isEnrolled);
}