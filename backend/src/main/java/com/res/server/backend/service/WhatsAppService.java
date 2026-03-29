package com.res.server.backend.service;

public interface WhatsAppService {

    /**
     * Sends the given PDF bytes as a WhatsApp document message.
     */
    void sendPdfDocument(String toPhoneNumber, byte[] pdfBytes, String filename, String caption);
}

