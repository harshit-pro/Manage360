package com.res.server.backend.controller;

import com.res.server.backend.entity.Alert;
import com.res.server.backend.repository.AlertRepository;
import com.res.server.backend.service.context.LibraryContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER','STAFF')")
public class AlertController {

    private final AlertRepository alertRepo;

    @GetMapping
    public List<Alert> dueAlerts() {
        UUID libraryId = LibraryContext.getLibraryId();
        return alertRepo.findByLibrary_IdAndScheduledForLessThanEqual(
                libraryId, LocalDate.now()
        );
    }
}