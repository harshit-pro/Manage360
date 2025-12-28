package com.res.server.backend.controller;

import com.res.server.backend.dto.request.LoginRequest;
import com.res.server.backend.dto.request.SignupRequest;
import com.res.server.backend.dto.response.LoginResponse;
import com.res.server.backend.dto.response.SignupResponse;
import com.res.server.backend.entity.User;
import com.res.server.backend.repository.UserRepository;
import com.res.server.backend.security.JwtUtil;
import com.res.server.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmailAndEnabledTrue(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtUtil.generate(
                Map.of(
                        "role", user.getRole().name(),
                        "libraryId", user.getLibrary().getId().toString()
                ),
                user.getEmail()
        );
        return new LoginResponse(token);
    }

    @PostMapping("/signup")
    public SignupResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }
}