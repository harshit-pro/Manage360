package com.res.server.backend.config;
import com.cloudinary.Cloudinary;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    @ConditionalOnProperty(name = "cloudinary.enabled", havingValue = "true")
    public Cloudinary cloudinary() {
        if (cloudName == null || cloudName.isEmpty() ||
            apiKey == null || apiKey.isEmpty() ||
            apiSecret == null || apiSecret.isEmpty()) {
            throw new IllegalStateException(
                "Cloudinary configuration is incomplete. Please set cloudinary.cloud-name, " +
                "cloudinary.api-key, and cloudinary.api-secret in application properties or environment variables."
            );
        }

        return new Cloudinary(Map.of(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }
}