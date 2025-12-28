package com.res.server.backend.service;

import com.res.server.backend.dto.response.MembershipRenewResponse;
import com.res.server.backend.entity.Library;
import com.res.server.backend.entity.Student;
import com.res.server.backend.entity.enums.MembershipStatus;
import com.res.server.backend.entity.enums.PaymentMethod;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.repository.MembershipRepository;
import com.res.server.backend.repository.StudentRepository;
import com.res.server.backend.service.context.LibraryContext;
import com.res.server.backend.util.TestDataFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class MembershipServiceTest {

    @Autowired
    MembershipService membershipService;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    MembershipRepository membershipRepository;

    @Autowired
    LibraryRepository libraryRepository;

    @AfterEach
    void tearDown() {
        LibraryContext.clear();
    }

    @Test
    void renewMembership_shouldExtendCorrectly_whenExpired() {

        Library library = new Library();
        library.setName("Test Library");
        library.setTotalSeats(100);
        library = libraryRepository.save(library);

        LibraryContext.setLibraryId(library.getId());

        Student student = TestDataFactory.expiredMembershipStudent(library);
        studentRepository.save(student);

        LocalDate before = student.getMembership().getActiveUntil();

        MembershipRenewResponse response =
                membershipService.renew(
                        student.getId(),
                        2,
                        1000,
                        PaymentMethod.CASH,
                        "Renewal"
                );

        assertTrue(response.getActiveUntil().isAfter(before));
        assertEquals(MembershipStatus.ACTIVE, response.getStatus());
    }
}