package com.res.server.backend.service.impl;

import com.res.server.backend.entity.Library;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.repository.StudentRepository;
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
    private final StudentRepository studentRepository;

    private int getNextSequence(Library library) {
        String maxRegNo = studentRepository.findMaxRegNoByLibraryId(library.getId());
        if (maxRegNo != null && maxRegNo.startsWith(library.getRegPrefix())) {
            try {
                String numericPart = maxRegNo.substring(library.getRegPrefix().length());
                if (!numericPart.isEmpty()) {
                    return Integer.parseInt(numericPart) + 1;
                }
            } catch (NumberFormatException e) {
                // Ignore and fall back to 1
            }
        }
        return 1;
    }

    @Override
    public String generate() {
        UUID libraryId = LibraryContext.getLibraryId();

        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalStateException("Library not found"));

        String prefix = library.getRegPrefix();
        int seq = getNextSequence(library);
        
        // Use fixed width of 4 digits
        String regNo = String.format("%s%04d", prefix, seq);

        // increment sequence just to keep it somewhat in sync
        library.setNextRegSeq(seq + 1);
        libraryRepository.save(library);
        return regNo;
    }

    @Override
    public String peek() {
        UUID libraryId = LibraryContext.getLibraryId();

        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalStateException("Library not found"));

        String prefix = library.getRegPrefix();
        int seq = getNextSequence(library);
        
        // Use fixed width of 4 digits
        return String.format("%s%04d", prefix, seq);
    }
}