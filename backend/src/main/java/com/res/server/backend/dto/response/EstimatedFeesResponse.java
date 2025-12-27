package com.res.server.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EstimatedFeesResponse {

    private int estimated;
    private int collected;
    private int remaining;
}