package com.res.server.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LibraryUpdateRequest {
    private String name;
    private String address;
    private String city;
    private Integer totalSeats;
    private String contact;
}
