package com.res.server.backend.service.impl;

import com.res.server.backend.dto.response.DashboardSummaryResponse;
import com.res.server.backend.dto.response.EstimatedFeesResponse;
import com.res.server.backend.entity.enums.MembershipStatus;
import com.res.server.backend.repository.MembershipRepository;
import com.res.server.backend.repository.PaymentRepository;
import com.res.server.backend.repository.StudentRepository;
import com.res.server.backend.service.DashboardService;
import com.res.server.backend.service.context.LibraryContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final StudentRepository studentRepo;
    private final MembershipRepository membershipRepo;
    private final PaymentRepository paymentRepo;

    @Override
    public DashboardSummaryResponse summary(int dueInDays) {

        UUID libraryId = LibraryContext.getLibraryId();
        LocalDate limit = LocalDate.now().plusDays(dueInDays);

        long totalStudents = studentRepo.countByLibrary_Id(libraryId);
        long activeStudents = studentRepo.countByLibrary_IdAndIsEnrolledTrue(libraryId);
        long expired = membershipRepo.countByLibrary_IdAndStatus(libraryId, MembershipStatus.EXPIRED);
        long due = membershipRepo.countDue(libraryId, limit);
        int pendingFees = studentRepo.totalPendingFees(libraryId);
        int totalRevenue = paymentRepo.totalRevenue(libraryId);

//        Map<String, Integer> revenueByMethod = paymentRepo.revenueByMethod(libraryId)
//                .stream()
//                .collect(Collectors.toMap(
//                        r -> r[0].toString(),
//                        r -> ((Number) r[1]).intValue()
//                ));

        return new DashboardSummaryResponse(
                totalStudents,
                activeStudents,
                expired,
                due,
                pendingFees,
                totalRevenue,
                Map.of() // revenueByMethod
        );
    }

    @Override
    public EstimatedFeesResponse estimatedFees() {

        UUID libraryId = LibraryContext.getLibraryId();

        Object result = studentRepo.estimatedVsCollected(libraryId);
        Object[] row = (Object[]) result;

        int estimated = ((Number) row[0]).intValue();
        int collected = ((Number) row[1]).intValue();

        return new EstimatedFeesResponse(
                estimated,
                collected,
                estimated - collected
        );
    }
}
