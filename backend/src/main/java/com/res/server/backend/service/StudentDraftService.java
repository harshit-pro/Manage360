package com.res.server.backend.service;

import com.res.server.backend.entity.StudentDraft;
import java.util.List;
import java.util.UUID;

public interface StudentDraftService {
    List<StudentDraft> getAllDrafts();
    StudentDraft create(StudentDraft draft);
    StudentDraft update(UUID id, com.res.server.backend.dto.request.StudentDraftRequest request);
    void delete(UUID id);
    StudentDraft getById(UUID id);
}
