package com.res.server.backend.service;

import com.res.server.backend.dto.request.SeatAssignmentRequest;
import com.res.server.backend.dto.response.SeatAssignmentResponse;
import com.res.server.backend.dto.response.SeatMapResponse;

import java.util.List;
import java.util.UUID;

public interface SeatAssignmentService {
    SeatAssignmentResponse assignSeat(SeatAssignmentRequest request);

    List<SeatMapResponse> getSeatMap(UUID batchId);

    void removeAssignment(UUID id);
}


