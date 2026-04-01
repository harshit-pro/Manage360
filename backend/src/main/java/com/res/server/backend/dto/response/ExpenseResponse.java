package com.res.server.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseResponse {
    private UUID id;
    private Double amount;
    private String category;
    private String note;
    private LocalDate spentAt;
}
