package com.res.server.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {

    // Library details
    @NotBlank
    private String libraryName;

    private String address;
    private String city;

    @NotNull
    private Integer totalSeats;

    // Owner details
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}