package com.res.server.backend.util;

import com.res.server.backend.entity.Library;
import com.res.server.backend.entity.Membership;
import com.res.server.backend.entity.Student;
import com.res.server.backend.entity.enums.MembershipStatus;

import java.time.LocalDate;

public class TestDataFactory {

    private static String regNo10() {
        // 10 chars max (DB column is VARCHAR(10))
        String digits = String.valueOf(Math.abs((int) (Math.random() * 1_000_000_000L)));
        // left pad to 10
        return ("0000000000" + digits).substring(("0000000000" + digits).length() - 10);
    }

    public static Student expiredMembershipStudent(Library library) {
        Student student = new Student();
        student.setLibrary(library);
        student.setRegNo(regNo10());
        student.setName("Test Student");
        student.setSeasonalFees(3000); // NOT NULL in DB
        student.setFeesDeposited(0);
        student.setIsEnrolled(true);

        Membership membership = new Membership();
        membership.setLibrary(library);
        membership.setStatus(MembershipStatus.EXPIRED);
        membership.setActiveUntil(LocalDate.now().minusDays(1));
        student.setMembership(membership);
        membership.setStudent(student);

        return student;
    }

    public static Student studentWithFees(Library library, int total, int deposited) {
        Student student = new Student();
        student.setLibrary(library);
        student.setSeasonalFees(total);
        student.setFeesDeposited(deposited);
        student.setRegNo(regNo10());
        student.setName("Test Student");
        student.setIsEnrolled(true);
        return student;
    }
}