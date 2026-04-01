package com.res.server.backend.service.impl;

import com.res.server.backend.dto.response.MonthlyPaymentItemResponse;
import com.res.server.backend.entity.Payment;
import com.res.server.backend.entity.Student;
import com.res.server.backend.entity.enums.PaymentMethod;
import com.res.server.backend.entity.enums.PaymentType;
import com.res.server.backend.repository.PaymentRepository;
import com.res.server.backend.repository.StudentRepository;
import com.res.server.backend.service.PaymentService;
import com.res.server.backend.service.context.LibraryContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public UUID paySeasonalFee(UUID studentId, int amount, PaymentMethod method, String note, String referenceId) {
        UUID libraryId = LibraryContext.getLibraryId();
        Student student = studentRepository.findByIdAndLibrary_Id(studentId, libraryId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        student.setFeesDeposited(student.getFeesDeposited() + amount);

        Payment payment = new Payment();
        payment.setLibrary(student.getLibrary());
        payment.setStudent(student);
        payment.setType(PaymentType.SEASONAL_FEE);
        payment.setAmount(amount);
        payment.setMethod(method);
        payment.setPaidAt(Instant.now());
        payment.setNote(note);
        payment.setReferenceId(referenceId);
        // One-time seasonal fee payment: no coverage period.
        payment.setPeriodStart(null);
        payment.setPeriodEnd(null);
        paymentRepository.save(payment);
        studentRepository.save(student);
        return payment.getId();
    }

    @Override
    public MonthlyPaymentItemResponse getPaymentDetails(UUID paymentId) {
        UUID libraryId = LibraryContext.getLibraryId();
        Payment payment = paymentRepository.findByIdWithStudentAndLibrary(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        if (!payment.getLibrary().getId().equals(libraryId)) {
            throw new IllegalArgumentException("Access denied");
        }

        Student s = payment.getStudent();
        return new MonthlyPaymentItemResponse(
                payment.getId(),
                payment.getType(),
                payment.getMethod(),
                payment.getAmount(),
                payment.getPaidAt(),
                payment.getPeriodStart(),
                payment.getPeriodEnd(),
                s.getId(),
                s.getName(),
                s.getRegNo(),
                s.getSeatNo(),
                s.getDateOfJoining(),
                s.getMobileNo(),
                payment.getNote()
        );
    }
}