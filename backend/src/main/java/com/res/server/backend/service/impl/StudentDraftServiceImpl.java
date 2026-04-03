package com.res.server.backend.service.impl;

import com.res.server.backend.entity.Library;
import com.res.server.backend.entity.StudentDraft;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.repository.StudentDraftRepository;
import com.res.server.backend.service.StudentDraftService;
import com.res.server.backend.service.context.LibraryContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentDraftServiceImpl implements StudentDraftService {

    private final StudentDraftRepository studentDraftRepository;
    private final LibraryRepository libraryRepository;

    @Override
    public List<StudentDraft> getAllDrafts() {
        return studentDraftRepository.findAllByLibraryIdOrderByUpdatedAtDesc(LibraryContext.getLibraryId());
    }

    @Override
    public StudentDraft create(StudentDraft draft) {
        UUID libraryId = LibraryContext.getLibraryId();
        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalStateException("Library not found"));
        draft.setLibrary(library);
        return studentDraftRepository.save(draft);
    }

    @Override
    public StudentDraft update(UUID id, com.res.server.backend.dto.request.StudentDraftRequest request) {
        StudentDraft draft = getById(id);
        if (request.getName() != null) draft.setName(request.getName());
        if (request.getMobileNo() != null) draft.setMobileNo(request.getMobileNo());
        if (request.getSeatNo() != null) draft.setSeatNo(request.getSeatNo());
        if (request.getDateOfVisit() != null) draft.setDateOfVisit(request.getDateOfVisit());
        if (request.getNotes() != null) draft.setNotes(request.getNotes());
        return studentDraftRepository.save(draft);
    }

    @Override
    public void delete(UUID id) {
        StudentDraft draft = getById(id);
        studentDraftRepository.delete(draft);
    }

    @Override
    public StudentDraft getById(UUID id) {
        return studentDraftRepository.findByIdAndLibrary_Id(id, LibraryContext.getLibraryId())
                .orElseThrow(() -> new IllegalArgumentException("Draft not found or access denied"));
    }
}
