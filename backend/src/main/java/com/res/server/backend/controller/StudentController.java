package com.res.server.backend.controller;


import com.res.server.backend.dto.mapper.StudentMapper;
import com.res.server.backend.dto.request.StudentCreateRequest;
import com.res.server.backend.dto.response.StudentResponse;
import com.res.server.backend.entity.Student;
import com.res.server.backend.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final StudentMapper studentMapper;

    @PostMapping
    public StudentResponse create(@Valid @RequestBody StudentCreateRequest request) {
        Student student = studentMapper.toEntity(request);
        return studentMapper.toResponse(studentService.create(student));
    }

    @GetMapping("/{id}")
    public StudentResponse get(@PathVariable UUID id) {
        return studentMapper.toResponse(studentService.getById(id));
    }

    @GetMapping
    public Page<StudentResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean isEnrolled,
            Pageable pageable
    ) {
        return studentService.search(q, isEnrolled, pageable)
                .map(studentMapper::toResponse);
    }

    @PatchMapping("/{id}/enrollment")
    public StudentResponse updateEnrollment(
            @PathVariable UUID id,
            @RequestParam boolean isEnrolled
    ) {
        return studentMapper.toResponse(
                studentService.updateEnrollment(id, isEnrolled)
        );
    }
}