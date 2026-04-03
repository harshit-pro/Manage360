package com.res.server.backend.dto.mapper;

import com.res.server.backend.dto.request.StudentDraftRequest;
import com.res.server.backend.dto.response.StudentDraftResponse;
import com.res.server.backend.entity.StudentDraft;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StudentDraftMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "library", ignore = true)
    StudentDraft toEntity(StudentDraftRequest request);

    StudentDraftResponse toResponse(StudentDraft studentDraft);
}
