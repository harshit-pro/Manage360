package com.res.server.backend.service;

import com.res.server.backend.entity.Library;
import com.res.server.backend.entity.Student;
import com.res.server.backend.entity.enums.PaymentMethod;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.repository.StudentRepository;
import com.res.server.backend.service.context.LibraryContext;
import com.res.server.backend.util.TestDataFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@Transactional
class PaymentServiceTest {

    @Autowired
    PaymentService paymentService;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    LibraryRepository libraryRepository;

    @AfterEach
    void cleanup() {
        LibraryContext.clear();
    }

    @Test
    void seasonalPayment_shouldIncreaseFeesDeposited() {

        Library library = new Library();
        library.setName("Test Library");
        library = libraryRepository.save(library);

        // Set the library context for the test
        LibraryContext.setLibraryId(library.getId());

        Student student = TestDataFactory.studentWithFees(library, 3000, 0);
        studentRepository.save(student);

        UUID paymentId = paymentService.paySeasonalFee(
                student.getId(),
                1000,
                PaymentMethod.UPI,
                "Installment",
                "REF-001"
        );

        Student updated =
                studentRepository.findById(student.getId()).orElseThrow();

        assertEquals(1000, updated.getFeesDeposited());
        assertNotNull(paymentId);
    }
}