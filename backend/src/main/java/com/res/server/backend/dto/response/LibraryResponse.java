package com.res.server.backend.dto.response;

import com.res.server.backend.entity.Library;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
public class LibraryResponse {

    private final UUID id;
    private final String name;
    private final String address;
    private final String city;
    private final Integer totalSeats;
    private final String contact;
    private final Instant createdAt;

    public LibraryResponse(Library library) {
        this.id = library.getId();
        this.name = library.getName();
        this.address = library.getAddress();
        this.city = library.getCity();
        this.totalSeats = library.getTotalSeats();
        this.contact = library.getContact();
        this.createdAt = library.getCreatedAt();
    }
}
