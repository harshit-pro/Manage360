package com.res.server.backend.service.impl;

import com.res.server.backend.dto.mapper.BatchMapper;
import com.res.server.backend.dto.request.BatchRequest;
import com.res.server.backend.dto.response.BatchDto;
import com.res.server.backend.entity.Batch;
import com.res.server.backend.entity.Library;
import com.res.server.backend.repository.BatchRepository;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.service.BatchService;
import com.res.server.backend.service.context.LibraryContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {

    private final BatchRepository batchRepository;
    private final LibraryRepository libraryRepository;
    private final BatchMapper batchMapper;

    @Override
    @Transactional
    public BatchDto create(BatchRequest request) {
        UUID libraryId = LibraryContext.getLibraryId();
        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalStateException("Library not found"));

        Batch batch = batchMapper.toEntity(request);
        batch.setLibrary(library);

        return batchMapper.toDto(batchRepository.save(batch));
    }

    @Override
    public List<BatchDto> list() {
        UUID libraryId = LibraryContext.getLibraryId();
        return batchRepository.findByLibrary_IdOrderByStartTimeAsc(libraryId).stream()
                .map(batchMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BatchDto update(UUID id, BatchRequest request) {
        UUID libraryId = LibraryContext.getLibraryId();
        Batch batch = batchRepository.findByIdAndLibrary_Id(id, libraryId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));

        if (request.getName() != null) {
            batch.setName(request.getName());
        }
        if (request.getStartTime() != null) {
            batch.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            batch.setEndTime(request.getEndTime());
        }
        if (request.getActive() != null) {
            batch.setActive(request.getActive());
        }

        return batchMapper.toDto(batchRepository.save(batch));
    }
}

