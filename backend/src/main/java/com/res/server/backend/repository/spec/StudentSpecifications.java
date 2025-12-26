package com.res.server.backend.repository.spec;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.res.server.backend.entity.Student;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class StudentSpecifications {
    public static Specification<Student> belongsToLibrary(UUID libraryId) {
        return (root, query, cb) ->
                cb.equal(root.get("library").get("id"), libraryId);
    }
    public static Specification<Student> isEnrolled(Boolean isEnrolled) {
        return (root, query, cb) ->
                isEnrolled == null ? null : cb.equal(root.get("isEnrolled"), isEnrolled);
    }
    public static Specification<Student> search(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return null;

            String like = "%" + q.toLowerCase() + "%";
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.like(cb.lower(root.get("name")), like));
            predicates.add(cb.like(cb.lower(root.get("regNo")), like));
            predicates.add(cb.like(cb.lower(root.get("seatNo")), like));
            predicates.add(cb.like(cb.lower(root.get("mobileNo")), like));
            predicates.add(cb.like(cb.lower(root.get("aadharNo")), like));

            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }
}
//This enables:
//        •	Search by name / regNo / seat / mobile / aadhar
//	•	Clean, composable filters