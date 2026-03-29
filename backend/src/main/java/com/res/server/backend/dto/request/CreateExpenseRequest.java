package com.res.server.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateExpenseRequest {

    @NotNull
    @Min(1)
    private Integer amount;

    @NotBlank
    private String category;

    private String note;

    /**
     * Date on which the expense was made.
     * If omitted, backend will use today's date.
     */
    private LocalDate spentAt;
}

