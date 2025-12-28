package com.res.server.backend.service;

import com.res.server.backend.entity.Student;
import com.res.server.backend.entity.enums.PaymentMethod;
import com.res.server.backend.repository.StudentRepository;
import com.res.server.backend.util.TestDataFactory;
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

    @Test
    void seasonalPayment_shouldIncreaseFeesDeposited() {

        Student student = TestDataFactory.studentWithFees(3000, 0);
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