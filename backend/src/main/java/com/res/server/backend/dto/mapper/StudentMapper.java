package com.res.server.backend.dto.mapper;


import com.res.server.backend.dto.request.StudentCreateRequest;
import com.res.server.backend.dto.response.StudentResponse;
import com.res.server.backend.entity.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StudentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "library", ignore = true)
    @Mapping(target = "regNo", ignore = true)
    @Mapping(target = "membership", ignore = true)
    Student toEntity(StudentCreateRequest request);

    @Mapping(source = "membership", target = "membership")
    StudentResponse toResponse(Student student);
}