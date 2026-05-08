package com.res.server.backend.dto.mapper;

import com.res.server.backend.dto.request.BatchRequest;
import com.res.server.backend.dto.response.BatchDto;
import com.res.server.backend.entity.Batch;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BatchMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "library", ignore = true)
    @Mapping(target = "active", expression = "java(request.getActive() == null ? true : request.getActive())")
    Batch toEntity(BatchRequest request);

    BatchDto toDto(Batch batch);
}

