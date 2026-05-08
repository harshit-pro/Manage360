package com.res.server.backend.service.impl;

import com.res.server.backend.dto.request.SeatAssignmentRequest;
import com.res.server.backend.dto.response.SeatAssignmentResponse;
import com.res.server.backend.dto.response.SeatMapResponse;
import com.res.server.backend.entity.Batch;
import com.res.server.backend.entity.Library;
import com.res.server.backend.entity.Seat;
import com.res.server.backend.entity.SeatAssignment;
import com.res.server.backend.entity.Student;
import com.res.server.backend.repository.BatchRepository;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.repository.SeatAssignmentRepository;
import com.res.server.backend.repository.SeatRepository;
import com.res.server.backend.repository.StudentRepository;
import com.res.server.backend.service.SeatAssignmentService;
import com.res.server.backend.service.context.LibraryContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatAssignmentServiceImpl implements SeatAssignmentService {

    private final SeatAssignmentRepository seatAssignmentRepository;
    private final SeatRepository seatRepository;
    private final StudentRepository studentRepository;
    private final BatchRepository batchRepository;
    private final LibraryRepository libraryRepository;

    @Override
    @Transactional
    public SeatAssignmentResponse assignSeat(SeatAssignmentRequest request) {
        UUID libraryId = LibraryContext.getLibraryId();
        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalStateException("Library not found"));

        Student student = studentRepository.findByIdAndLibrary_Id(request.getStudentId(), libraryId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        Seat seat = seatRepository.findByIdAndLibrary_Id(request.getSeatId(), libraryId)
                .orElseThrow(() -> new IllegalArgumentException("Seat not found"));
        Batch batch = batchRepository.findByIdAndLibrary_Id(request.getBatchId(), libraryId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));

        if (seatAssignmentRepository.existsBySeat_IdAndBatch_IdAndLibrary_IdAndActiveTrue(seat.getId(), batch.getId(), libraryId)) {
            throw new IllegalArgumentException("Seat already assigned in this batch");
        }
        if (seatAssignmentRepository.existsByStudent_IdAndBatch_IdAndLibrary_IdAndActiveTrue(student.getId(), batch.getId(), libraryId)) {
            throw new IllegalArgumentException("Student already has a seat in this batch");
        }

        SeatAssignment assignment = new SeatAssignment();
        assignment.setStudent(student);
        assignment.setSeat(seat);
        assignment.setBatch(batch);
        assignment.setStartDate(request.getStartDate());
        assignment.setEndDate(request.getEndDate());
        assignment.setActive(true);
        assignment.setLibrary(library);

        SeatAssignment saved = seatAssignmentRepository.save(assignment);
        log.info("Assigned seat {} to student {} for batch {}", seat.getSeatNumber(), student.getId(), batch.getId());

        SeatAssignmentResponse response = new SeatAssignmentResponse();
        response.setId(saved.getId());
        response.setStudentId(student.getId());
        response.setSeatId(seat.getId());
        response.setBatchId(batch.getId());
        response.setStartDate(saved.getStartDate());
        response.setEndDate(saved.getEndDate());
        response.setActive(saved.isActive());
        return response;
    }

    @Override
    public List<SeatMapResponse> getSeatMap(UUID batchId) {
        UUID libraryId = LibraryContext.getLibraryId();

        List<Seat> seats = seatRepository.findByLibrary_IdOrderByRowNoAscColNoAsc(libraryId);
        Map<UUID, SeatAssignment> assignmentBySeatId = seatAssignmentRepository
                .findActiveAssignmentsForBatch(batchId, libraryId)
                .stream()
                .collect(Collectors.toMap(sa -> sa.getSeat().getId(), sa -> sa));

        List<SeatMapResponse> result = new ArrayList<>();
        for (Seat seat : seats) {
            SeatAssignment assignment = assignmentBySeatId.get(seat.getId());
            SeatMapResponse response = new SeatMapResponse();
            response.setSeatId(seat.getId());
            response.setSeatNumber(seat.getSeatNumber());
            response.setRowNo(seat.getRowNo());
            response.setColNo(seat.getColNo());

            if (assignment != null) {
                response.setOccupied(true);
                response.setStudentName(assignment.getStudent().getName());
                response.setRegNo(assignment.getStudent().getRegNo());
            } else {
                response.setOccupied(false);
            }
            result.add(response);
        }

        return result;
    }

    @Override
    @Transactional
    public void removeAssignment(UUID id) {
        UUID libraryId = LibraryContext.getLibraryId();
        SeatAssignment assignment = seatAssignmentRepository.findByIdAndLibrary_Id(id, libraryId)
                .orElseThrow(() -> new IllegalArgumentException("Seat assignment not found"));

        assignment.setActive(false);
        seatAssignmentRepository.save(assignment);
        log.info("Deactivated seat assignment {}", id);
    }
}

