package com.res.server.backend.controller;

import com.res.server.backend.dto.request.BatchRequest;
import com.res.server.backend.dto.response.BatchDto;
import com.res.server.backend.service.BatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER','STAFF')")
public class BatchController {

    private final BatchService batchService;

    @PostMapping
    public BatchDto create(@Valid @RequestBody BatchRequest request) {
        return batchService.create(request);
    }

    @GetMapping
    public List<BatchDto> list() {
        return batchService.list();
    }

    @PatchMapping("/{id}")
    public BatchDto update(@PathVariable UUID id, @RequestBody BatchRequest request) {
        return batchService.update(id, request);
    }
}

