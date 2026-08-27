package com.res.server.backend.service;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "cloudinary.enabled", havingValue = "true")
public class ImageService {

    private final Cloudinary cloudinary;

    public String uploadProfileImage(MultipartFile file) {

        try {
            // ✅ VALIDATION
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image")) {
                throw new RuntimeException("Only image files allowed");
            }

            if (file.getSize() > 2 * 1024 * 1024) {
                throw new RuntimeException("Max size 2MB");
            }

            // ✅ UPLOAD
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(
                    file.getBytes(),
                    Map.of(
                            "folder", "manage360/profile",
                            "transformation", "w_300,h_300,c_fill"
                    )
            );

            return uploadResult.get("secure_url").toString();

        } catch (Exception e) {
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }
    }
}