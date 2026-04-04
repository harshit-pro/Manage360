package com.res.server.backend.service.impl;

import com.res.server.backend.entity.Library;
import com.res.server.backend.entity.Membership;
import com.res.server.backend.entity.Student;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.repository.MembershipRepository;
import com.res.server.backend.repository.StudentRepository;
import com.res.server.backend.repository.spec.StudentSpecifications;
import com.res.server.backend.service.RegNoService;
import com.res.server.backend.service.StudentService;
import com.res.server.backend.entity.enums.MembershipStatus;

import com.res.server.backend.service.context.LibraryContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final MembershipRepository membershipRepository;
    private final LibraryRepository libraryRepository;
    private final RegNoService regNoService;

    @Override
    public Student create(Student student) {
        UUID libraryId = LibraryContext.getLibraryId();
        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalStateException("Library not found"));

        student.setLibrary(library);

        if (student.getRegNo() == null) {
            student.setRegNo(regNoService.generate());
        }

        Student saved = studentRepository.save(student);

        // Create default EXPIRED membership
        Membership membership = new Membership();
        membership.setLibrary(library);
        membership.setStudent(saved);
        membership.setActiveUntil(LocalDate.now().minusDays(1));
        membership.setStatus(MembershipStatus.EXPIRED);
        membershipRepository.save(membership);

        return saved;
    }

    @Override
    public Student getById(UUID id) {
        return studentRepository.findByIdAndLibrary_Id(id, LibraryContext.getLibraryId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
    }

    @Override
    public Page<Student> search(
            UUID libraryId,
            String q,
            Boolean isEnrolled,
            Pageable pageable) {
        return studentRepository.searchByLibrary(
                libraryId,
                q,
                isEnrolled,
                pageable);
    }

    @Override
    public Student updateEnrollment(UUID id, boolean isEnrolled) {
        Student student = getById(id);
        student.setIsEnrolled(isEnrolled);
        return studentRepository.save(student);
    }

    @Override
    public Student update(UUID id, com.res.server.backend.dto.request.StudentUpdateRequest req) {
        Student student = getById(id);

        // Capture old joining date for recalculation logic
        LocalDate oldJoiningDate = student.getDateOfJoining();

        if (req.getName() != null)
            student.setName(req.getName());
        if (req.getSeatNo() != null)
            student.setSeatNo(req.getSeatNo());
        if (req.getMobileNo() != null)
            student.setMobileNo(req.getMobileNo());
        if (req.getAddress() != null)
            student.setAddress(req.getAddress());
        if (req.getAadharNo() != null)
            student.setAadharNo(req.getAadharNo());
        if (req.getGuardianName() != null)
            student.setGuardianName(req.getGuardianName());
        if (req.getGuardianMobile() != null)
            student.setGuardianMobile(req.getGuardianMobile());
        if (req.getGender() != null)
            student.setGender(req.getGender());
        if (req.getSeasonalFees() != null)
            student.setSeasonalFees(req.getSeasonalFees());

        // If joining date is being updated
        if (req.getDateOfJoining() != null) {
            student.setDateOfJoining(req.getDateOfJoining());

            // Recalculate membership expiry if one exists
            Membership membership = student.getMembership();
            if (membership != null && membership.getActiveUntil() != null) {
                long months;
                if (oldJoiningDate != null) {
                    // Calculate full months difference
                    months = ChronoUnit.MONTHS.between(oldJoiningDate, membership.getActiveUntil());
                } else {
                    months = 1; // Default fallback
                }
                // Shift the activeUntil date based on the new joining date
                LocalDate newActiveUntil = student.getDateOfJoining().plusMonths(Math.max(months, 1));
                membership.setActiveUntil(newActiveUntil);
                // The cascade = ALL on Student.membership will handle saving this
            }
        }
        return studentRepository.save(student);
    }

    /**
     * Generate the next available seat number for a library
     * Finds the maximum numeric seat number and increments it
     */
    private String generateNextSeatNumber(UUID libraryId) {
        // Get all students for the library and find the max seat number
        String maxSeatNo = studentRepository.findMaxSeatNumberByLibraryId(libraryId);

        int nextSeatNumber = 1;
        if (maxSeatNo != null && !maxSeatNo.isEmpty()) {
            try {
                // Extract numeric part from the seat number (e.g., "SEAT-123" -> 123)
                String numericPart = maxSeatNo.replaceAll("\\D+", "");
                if (!numericPart.isEmpty()) {
                    nextSeatNumber = Integer.parseInt(numericPart) + 1;
                }
            } catch (NumberFormatException e) {
                // If parsing fails, keep default value of 1
                // This handles cases where seat numbers are not purely numeric
            }
        }

        return String.valueOf(nextSeatNumber);
    }

    @Override
    public boolean isSeatAvailable(String seatNo) {
        if (seatNo == null || seatNo.trim().isEmpty()) {
            return true;
        }
        UUID libraryId = LibraryContext.getLibraryId();
        // A seat is available if no ACTIVE (enrolled) student is using it
        return !studentRepository.existsByLibrary_IdAndSeatNoAndIsEnrolledTrue(libraryId, seatNo.trim());
    }

    @Override
    public String getNextRegNo() {
        return regNoService.peek();
    }
}