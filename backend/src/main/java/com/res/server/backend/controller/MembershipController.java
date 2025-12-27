package com.res.server.backend.controller;

import com.res.server.backend.dto.request.MembershipRenewRequest;
import com.res.server.backend.dto.response.MembershipRenewResponse;
import com.res.server.backend.repository.MembershipRepository;
import com.res.server.backend.service.MembershipService;
import com.res.server.backend.service.context.LibraryContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;
    private final MembershipRepository membershipRepository;
    @PostMapping("/{studentId}/renew")
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public MembershipRenewResponse renew(
            @PathVariable UUID studentId,
            @Valid @RequestBody MembershipRenewRequest req
    ) {
        return membershipService.renew(
                studentId, req.getMonths(), req.getAmount(), req.getMethod(), req.getNote()
        );
    }
    @GetMapping("/due")
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public List<UUID> due(@RequestParam(defaultValue = "5") int days) {
        UUID libraryId = LibraryContext.getLibraryId();
        LocalDate limit = LocalDate.now().plusDays(days);
        return membershipRepository
                .findByLibrary_IdAndActiveUntilLessThanEqual(libraryId, limit)
                .stream()
                .map(m -> m.getStudent().getId())
                .toList();
    }
}