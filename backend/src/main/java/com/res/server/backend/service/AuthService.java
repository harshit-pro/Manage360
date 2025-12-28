package com.res.server.backend.service;

import com.res.server.backend.dto.request.SignupRequest;
import com.res.server.backend.dto.response.SignupResponse;

public interface AuthService {
    SignupResponse signup(SignupRequest request);
}