package com.res.server.backend.security;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.SecretKey;

@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret:M2M0YzhjMDVjZWFhNDEyNjgzMGU3YmVkZGZjZjQ5NDI1YTA0YzQwOTg5YzlmZjEyN2NkYzNlZmY0YTA2MWQ3ZQ==}")
    private String secret;

    private SecretKey key;

    @PostConstruct
    public void init() {
        try {
            if (secret == null || secret.trim().isEmpty()) {
                throw new IllegalArgumentException("jwt.secret is not configured. Please set JWT_SECRET environment variable or jwt.secret in application properties.");
            }
            this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
            log.info("JWT key initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize JWT key", e);
            throw new RuntimeException("Failed to initialize JWT configuration: " + e.getMessage(), e);
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(key)
                .compact();
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    public String generate(Map<String, String> role, String email) {
        return Jwts.builder()
                .claims(role)
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}