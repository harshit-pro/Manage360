package com.res.server.backend.dto.mapper;

import com.res.server.backend.dto.response.SeatDto;
import com.res.server.backend.entity.Seat;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SeatMapper {
    SeatDto toDto(Seat seat);
}

