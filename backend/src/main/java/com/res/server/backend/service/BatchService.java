package com.res.server.backend.service;

import com.res.server.backend.dto.request.BatchRequest;
import com.res.server.backend.dto.response.BatchDto;

import java.util.List;
import java.util.UUID;

public interface BatchService {
    BatchDto create(BatchRequest request);

    List<BatchDto> list();

    BatchDto update(UUID id, BatchRequest request);
}

