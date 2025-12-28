package com.res.server.backend.service;

import com.res.server.backend.dto.response.EstimatedFeesResponse;
import com.res.server.backend.entity.Library;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.repository.StudentRepository;
import com.res.server.backend.service.context.LibraryContext;
import com.res.server.backend.util.TestDataFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@Transactional
class DashboardServiceTest {

    @Autowired
    DashboardService dashboardService;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    LibraryRepository libraryRepository;

    @AfterEach
    void tearDown() {
        LibraryContext.clear();
    }

    @Test
    void estimatedFees_shouldBeCalculatedCorrectly() {

        Library library = new Library();
        library.setName("Test Library");
        library.setTotalSeats(100);
        library = libraryRepository.save(library);

        LibraryContext.setLibraryId(library.getId());

        studentRepository.save(TestDataFactory.studentWithFees(library, 3000, 1000));
        studentRepository.save(TestDataFactory.studentWithFees(library, 2000, 2000));

        EstimatedFeesResponse response = dashboardService.estimatedFees();

        assertEquals(5000, response.getEstimated());
        assertEquals(3000, response.getCollected());
        assertEquals(2000, response.getRemaining());
    }
}