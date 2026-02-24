package com.res.server.backend.service.impl;

import com.res.server.backend.dto.response.MembershipRenewResponse;
import com.res.server.backend.entity.Membership;
import com.res.server.backend.entity.Payment;
import com.res.server.backend.entity.Student;
import com.res.server.backend.entity.enums.MembershipStatus;
import com.res.server.backend.entity.enums.PaymentMethod;
import com.res.server.backend.entity.enums.PaymentType;
import com.res.server.backend.repository.MembershipRepository;
import com.res.server.backend.repository.PaymentRepository;
import com.res.server.backend.repository.StudentRepository;
import com.res.server.backend.service.MembershipService;
import com.res.server.backend.service.context.LibraryContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MembershipServiceImpl implements MembershipService {

        private final MembershipRepository membershipRepository;
        private final StudentRepository studentRepository;
        private final PaymentRepository paymentRepository;

        @Override
        public MembershipRenewResponse renew(UUID studentId, int months, int amount, PaymentMethod method,
                        String note) {
                UUID libraryId = LibraryContext.getLibraryId();

                Student student = studentRepository.findByIdAndLibrary_Id(studentId, libraryId)
                                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

                Membership membership = membershipRepository
                                .findByStudent_IdAndLibrary_Id(studentId, libraryId)
                                .orElseThrow(() -> new IllegalStateException("Membership not found"));

                // Base date logic:
                // - If membership is still active (future date), extend from current
                // activeUntil
                // - If membership is expired, start from the student's dateOfJoining
                // (so "joined 22 Feb, 1 month" → active until 22 March, not today + 1 month)
                LocalDate today = LocalDate.now();
                LocalDate joiningDate = student.getDateOfJoining() != null ? student.getDateOfJoining() : today;

                LocalDate baseDate = membership.getActiveUntil() != null && membership.getActiveUntil().isAfter(today)
                                ? membership.getActiveUntil() // extend from current expiry if still active
                                : joiningDate; // start fresh from joining date if expired

                LocalDate newActiveUntil = baseDate.plusMonths(months);

                membership.setActiveUntil(newActiveUntil);
                membership.setStatus(MembershipStatus.ACTIVE);
                membership.setLastPaymentMethod(method);

                Payment payment = new Payment();
                payment.setLibrary(student.getLibrary());
                payment.setStudent(student);
                payment.setType(PaymentType.MEMBERSHIP_RENEWAL);
                payment.setAmount(amount);
                payment.setMethod(method);
                payment.setPaidAt(Instant.now());
                payment.setNote(note);

                paymentRepository.save(payment);
                membershipRepository.save(membership);
                return new MembershipRenewResponse(payment.getId(), newActiveUntil, MembershipStatus.ACTIVE);
        }
}
