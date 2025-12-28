package com.res.server.backend.service.impl;

import com.res.server.backend.dto.request.SignupRequest;
import com.res.server.backend.dto.response.SignupResponse;
import com.res.server.backend.entity.Library;
import com.res.server.backend.entity.User;
import com.res.server.backend.entity.enums.UserRole;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.repository.UserRepository;
import com.res.server.backend.security.JwtUtil;
import com.res.server.backend.service.AuthService;

import com.res.server.backend.util.PrefixUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final LibraryRepository libraryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public SignupResponse signup(SignupRequest request) {

        // 1. Prevent duplicate owner email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // 2. Create Library
        Library library = new Library();
        library.setName(request.getLibraryName());
        library.setAddress(request.getAddress());
        library.setCity(request.getCity());
        library.setTotalSeats(request.getTotalSeats());
        library.setRegPrefix(PrefixUtil.generate(request.getLibraryName()));
        library.setNextRegSeq(1);

        libraryRepository.save(library);

        // 3. Create OWNER user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.OWNER);
        user.setEnabled(true);
        user.setLibrary(library);

        userRepository.save(user);

        // 4. Generate JWT
        String token = jwtUtil.generate(
                Map.of(
                        "role", UserRole.OWNER.name(),
                        "libraryId", library.getId().toString()
                ),
                user.getEmail()
        );

        return new SignupResponse(token);
    }
}