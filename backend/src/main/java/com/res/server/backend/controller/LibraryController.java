package com.res.server.backend.controller;

import com.res.server.backend.dto.request.LibraryUpdateRequest;
import com.res.server.backend.dto.response.LibraryResponse;
import com.res.server.backend.entity.Library;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.service.context.LibraryContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryRepository libraryRepository;

    /**
     * GET /api/library/me
     * Returns the profile of the library that belongs to the currently
     * authenticated user.
     * The library ID is extracted from the JWT token via LibraryContext (set by
     * JwtAuthFilter).
     */
    @GetMapping("/me")
    public ResponseEntity<LibraryResponse> getMyLibrary() {
        UUID libraryId = LibraryContext.getLibraryId();
        if (libraryId == null) {
            throw new IllegalStateException("No library ID in context – check JWT token.");
        }
        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalArgumentException("Library not found for id: " + libraryId));
        return ResponseEntity.ok(new LibraryResponse(library));
    }

    /**
     * PUT /api/library/{id}
     * Updates mutable fields of the library (name, address, city, totalSeats,
     * contact).
     */
    @PutMapping("/{id}")
    public ResponseEntity<LibraryResponse> updateLibrary(
            @PathVariable UUID id,
            @RequestBody LibraryUpdateRequest request) {

        // Security: only allow updating own library
        UUID contextLibraryId = LibraryContext.getLibraryId();
        if (contextLibraryId == null || !contextLibraryId.equals(id)) {
            throw new IllegalArgumentException("You are not authorized to update this library.");
        }

        Library library = libraryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Library not found for id: " + id));

        if (request.getName() != null)
            library.setName(request.getName());
        if (request.getAddress() != null)
            library.setAddress(request.getAddress());
        if (request.getCity() != null)
            library.setCity(request.getCity());
        if (request.getTotalSeats() != null)
            library.setTotalSeats(request.getTotalSeats());
        if (request.getContact() != null)
            library.setContact(request.getContact());

        libraryRepository.save(library);
        return ResponseEntity.ok(new LibraryResponse(library));
    }
}
