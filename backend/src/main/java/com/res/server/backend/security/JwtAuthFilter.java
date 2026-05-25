package com.res.server.backend.security;


import com.res.server.backend.service.context.LibraryContext;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@Service
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws IOException, jakarta.servlet.ServletException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();

            // Skip if token is empty, literal "undefined"/"null", or doesn't have proper JWT format
            if (token.isEmpty()
                    || "undefined".equalsIgnoreCase(token)
                    || "null".equalsIgnoreCase(token)
                    || token.chars().filter(c -> c == '.').count() != 2) {
                log.debug("Skipping invalid or missing JWT token");
                chain.doFilter(request, response);
                return;
            }

            try {
                Claims claims = jwtUtil.parse(token);

                String email = claims.getSubject();
                UUID libraryId = UUID.fromString((String) claims.get("libraryId"));
                String role = (String) claims.get("role");

                LibraryContext.setLibraryId(libraryId);

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of(() -> "ROLE_" + role)
                        );

                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException | IllegalArgumentException e) {
                log.warn("JWT token validation failed: {}", e.getMessage());
                // Don't set authentication - request will be treated as unauthenticated
            }
        }

        try {
            chain.doFilter(request, response);
        } finally {
            LibraryContext.clear();
        }
    }
}

// this class is responsible for extracting JWT token from the request header, validating it,
// and setting the authentication in the security context.
// It also sets the library ID in the LibraryContext for use in other parts of the application.