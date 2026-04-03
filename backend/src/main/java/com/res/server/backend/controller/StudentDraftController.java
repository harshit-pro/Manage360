package com.res.server.backend.controller;

import com.res.server.backend.dto.mapper.StudentDraftMapper;
import com.res.server.backend.dto.request.StudentDraftRequest;
import com.res.server.backend.dto.response.StudentDraftResponse;
import com.res.server.backend.entity.StudentDraft;
import com.res.server.backend.service.StudentDraftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/drafts")
@RequiredArgsConstructor
public class StudentDraftController {

    private final StudentDraftService studentDraftService;
    private final StudentDraftMapper studentDraftMapper;

    @GetMapping
    public List<StudentDraftResponse> getAll() {
        return studentDraftService.getAllDrafts().stream()
                .map(studentDraftMapper::toResponse)
                .collect(Collectors.toList());
    }

    @PostMapping
    public StudentDraftResponse create(@Valid @RequestBody StudentDraftRequest request) {
        StudentDraft draft = studentDraftMapper.toEntity(request);
        return studentDraftMapper.toResponse(studentDraftService.create(draft));
    }

    @PutMapping("/{id}")
    public StudentDraftResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody StudentDraftRequest request) {
        return studentDraftMapper.toResponse(studentDraftService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        studentDraftService.delete(id);
    }

    @GetMapping("/{id}")
    public StudentDraftResponse get(@PathVariable UUID id) {
        return studentDraftMapper.toResponse(studentDraftService.getById(id));
    }
}
