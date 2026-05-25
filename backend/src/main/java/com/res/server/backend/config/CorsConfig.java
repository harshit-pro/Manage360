package com.res.server.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.*;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {
    // Cors is Cross-Origin Resource Sharing, it allows the frontend
    // (which is running on a different origin) to access the backend APIs
    // Real life example: frontend is running on http://localhost:5173 and
    // backend is running on http://localhost:8080, without CORS configuration,
    // the browser will block the requests from frontend to backend due to same-origin policy

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Parse the comma-separated frontend URLs from properties
        List<String> origins = Arrays.asList(allowedOrigins.split(","));

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}