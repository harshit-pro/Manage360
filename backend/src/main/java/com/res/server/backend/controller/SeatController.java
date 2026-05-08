package com.res.server.backend.controller;

import com.res.server.backend.dto.request.SeatAssignmentRequest;
import com.res.server.backend.dto.response.SeatAssignmentResponse;
import com.res.server.backend.dto.response.SeatMapResponse;
import com.res.server.backend.service.SeatAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER','STAFF')")
public class SeatController {

    private final SeatAssignmentService seatAssignmentService;

    @GetMapping("/map")
    public List<SeatMapResponse> getSeatMap(@RequestParam UUID batchId) {
        return seatAssignmentService.getSeatMap(batchId);
    }

    @PostMapping("/assign")
    public SeatAssignmentResponse assign(@Valid @RequestBody SeatAssignmentRequest request) {
        return seatAssignmentService.assignSeat(request);
    }

    @DeleteMapping("/assign/{id}")
    public void remove(@PathVariable UUID id) {
        seatAssignmentService.removeAssignment(id);
    }
}

