package com.res.server.backend.security;

import com.res.server.backend.entity.User;
import com.res.server.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {
        User user = userRepository.findByEmailAndEnabledTrue(email)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
     return new org.springframework.security.core.userdetails.User(
             user.getEmail(),
             user.getPasswordHash(),
             List.of(new SimpleGrantedAuthority("ROLE_" +user.getRole().name()))
            );
}
}