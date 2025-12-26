package com.res.server.backend.service.impl;

import com.res.server.backend.entity.Library;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.service.RegNoService;
import com.res.server.backend.service.context.LibraryContext;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RegNoServiceImpl implements RegNoService {

    private final LibraryRepository libraryRepository;

    @Override
    public String generate() {
        UUID libraryId = LibraryContext.getLibraryId();

        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalStateException("Library not found"));

        String prefix = library.getRegPrefix();
        int seq = library.getNextRegSeq();

        String regNo = String.format("%s%04d", prefix, seq);

        // increment sequence
        library.setNextRegSeq(seq + 1);
        libraryRepository.save(library);
        return regNo;
    }
}