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
                                .orElseGet(() -> createDefaultMembership(student));

                LocalDate today = LocalDate.now();
                LocalDate joiningDate = student.getDateOfJoining() != null ? student.getDateOfJoining() : today;

                LocalDate newActiveUntil;
                if (membership.getActiveUntil() != null && !membership.getActiveUntil().isBefore(today)) {
                        // Still active (inclusive through activeUntil day): extend from current period end
                        newActiveUntil = membership.getActiveUntil().plusMonths(months);
                } else {
                        // Expired (or ends today / stale): align to the student's monthly billing
                        // anchor (joining date), advance month-by-month until the period end is
                        // after today, then apply the purchased months. Mirrors frontend cycle logic.
                        LocalDate cycleEnd = firstPeriodEndStrictlyAfter(joiningDate, today);
                        newActiveUntil = cycleEnd.plusMonths(months - 1L);
                }

                membership.setActiveUntil(newActiveUntil);
                membership.setStatus(MembershipStatus.ACTIVE);
                membership.setLastPaymentMethod(method);

                // 🔥 Update student's cumulative deposited fees to reflect this payment
                student.setFeesDeposited(student.getFeesDeposited() + amount);
                studentRepository.save(student);

                Payment payment = new Payment();
                payment.setLibrary(student.getLibrary());
                payment.setStudent(student);
                payment.setType(PaymentType.MEMBERSHIP_RENEWAL);
                payment.setAmount(amount);
                payment.setMethod(method);
                payment.setPaidAt(Instant.now());
                payment.setNote(note);
                payment.setPeriodEnd(newActiveUntil);
                payment.setPeriodStart(newActiveUntil.minusMonths(months));

                paymentRepository.save(payment);
                membershipRepository.save(membership);
                return new MembershipRenewResponse(payment.getId(), newActiveUntil, MembershipStatus.ACTIVE);
        }

        /** First calendar month boundary strictly after {@code cursor}, stepping from {@code anchor}. */
        private static LocalDate firstPeriodEndStrictlyAfter(LocalDate anchor, LocalDate cursor) {
                LocalDate end = anchor;
                while (!end.isAfter(cursor)) {
                        end = end.plusMonths(1);
                }
                return end;
        }

        private Membership createDefaultMembership(Student student) {
                Membership m = new Membership();
                m.setLibrary(student.getLibrary());
                m.setStudent(student);
                m.setStatus(MembershipStatus.EXPIRED);
                LocalDate start = student.getDateOfJoining() != null ? student.getDateOfJoining() : LocalDate.now();
                m.setActiveUntil(start.minusDays(1));
                return membershipRepository.save(m);
        }
}
