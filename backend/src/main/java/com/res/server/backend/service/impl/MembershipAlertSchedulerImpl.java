package com.res.server.backend.service.impl;

import com.res.server.backend.entity.Alert;
import com.res.server.backend.entity.Membership;
import com.res.server.backend.entity.enums.AlertChannel;
import com.res.server.backend.entity.enums.AlertType;
import com.res.server.backend.entity.enums.MembershipStatus;
import com.res.server.backend.repository.AlertRepository;
import com.res.server.backend.repository.MembershipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipAlertSchedulerImpl {

    private final MembershipRepository membershipRepo;
    private final AlertRepository alertRepo;

//    @Scheduled(cron = "0 0 2 * * *") // daily at 2 AM
    @Scheduled(fixedRate = 60000) // every 5 seconds (for testing)
    @Transactional
    public void processMembershipAlerts() {
        log.info("🔥 MembershipAlertScheduler triggered");
        LocalDate today = LocalDate.now();

        // 1) Mark expired memberships
        List<Membership> expired = membershipRepo
                .findAllByActiveUntilBeforeAndStatus(today, MembershipStatus.ACTIVE);

        for (Membership m : expired) {
            m.setStatus(MembershipStatus.EXPIRED);

            createAlertIfAbsent(
                    m,
                    AlertType.EXPIRED,
                    today,
                    "Membership expired"
            );
        }

        // 2) Expiry soon alerts (2 days)
        LocalDate soon = today.plusDays(2);

        List<Membership> expiringSoon =
                membershipRepo.findAllByActiveUntilAndStatus(soon, MembershipStatus.ACTIVE);

        for (Membership m : expiringSoon) {
            createAlertIfAbsent(
                    m,
                    AlertType.EXPIRY_SOON,
                    soon,
                    "Membership expiring soon"
            );
        }
    }

    private void createAlertIfAbsent(
            Membership m,
            AlertType type,
            LocalDate date,
            String message
    ) {
        UUID libId = m.getLibrary().getId();
        UUID studentId = m.getStudent().getId();

        boolean exists = alertRepo.existsByLibrary_IdAndStudent_IdAndTypeAndScheduledFor(
                libId, studentId, type, date
        );

        if (!exists) {
            Alert alert = new Alert();
            alert.setLibrary(m.getLibrary());
            alert.setStudent(m.getStudent());
            alert.setType(type);
            alert.setScheduledFor(date);
            alert.setChannel(AlertChannel.LOG);
            alert.setPayload("\"" + message + "\"");
            alert.setSentAt(Instant.now());

            alertRepo.save(alert);

            log.info("[ALERT] {} | student={} | library={}",
                    type, studentId, libId);
        }
    }
}