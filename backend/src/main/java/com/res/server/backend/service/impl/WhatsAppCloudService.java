package com.res.server.backend.service.impl;

import com.res.server.backend.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class WhatsAppCloudService implements WhatsAppService {

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://graph.facebook.com/v21.0")
            .build();

    @Value("${whatsapp.cloud.phone-number-id:}")
    private String phoneNumberId;

    @Value("${whatsapp.cloud.access-token:}")
    private String accessToken;

    @Override
    public void sendPdfDocument(String toPhoneNumber, byte[] pdfBytes, String filename, String caption) {
        ensureConfigured();
        String to = normalizeToE164(toPhoneNumber);
        if (to == null) {
            throw new IllegalArgumentException("Invalid student mobile number");
        }

        String mediaId = uploadMedia(pdfBytes, filename);
        sendDocumentMessage(to, mediaId, filename, caption);
    }

    private void ensureConfigured() {
        if (phoneNumberId == null || phoneNumberId.isBlank() || accessToken == null || accessToken.isBlank()) {
            throw new IllegalStateException("WhatsApp Cloud API is not configured (missing phone-number-id/access-token)");
        }
    }

    private String uploadMedia(byte[] pdfBytes, String filename) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("messaging_product", "whatsapp");
        builder.part("type", "application/pdf");
        builder.part("file", new ByteArrayResource(pdfBytes) {
                    @Override
                    public String getFilename() {
                        return filename;
                    }
                })
                .contentType(MediaType.APPLICATION_PDF);

        MultiValueMap<String, org.springframework.http.HttpEntity<?>> body = builder.build();

        Map<?, ?> response = restClient.post()
                .uri("/{phoneNumberId}/media", phoneNumberId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("id") == null) {
            throw new IllegalStateException("WhatsApp media upload failed");
        }
        return response.get("id").toString();
    }

    private void sendDocumentMessage(String to, String mediaId, String filename, String caption) {
        Map<String, Object> payload = Map.of(
                "messaging_product", "whatsapp",
                "to", to,
                "type", "document",
                "document", Map.of(
                        "id", mediaId,
                        "filename", filename,
                        "caption", caption != null ? caption : ""
                )
        );

        restClient.post()
                .uri("/{phoneNumberId}/messages", phoneNumberId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toBodilessEntity();
    }

    /**
     * Converts stored numbers to digits-only international format acceptable to WhatsApp Cloud API.
     * Assumption: if 10 digits and no country code, default to India (+91).
     */
    private static String normalizeToE164(String input) {
        if (input == null) return null;
        String digits = input.replaceAll("[^0-9+]", "");
        if (digits.isBlank()) return null;

        // If already starts with '+', remove it for WhatsApp 'to' (expects digits)
        if (digits.startsWith("+")) {
            String d = digits.substring(1).replaceAll("[^0-9]", "");
            return d.isBlank() ? null : d;
        }

        String onlyDigits = digits.replaceAll("[^0-9]", "");
        if (onlyDigits.length() == 10) {
            return "91" + onlyDigits;
        }
        if (onlyDigits.length() >= 11 && onlyDigits.length() <= 15) {
            return onlyDigits;
        }
        return null;
    }
}

