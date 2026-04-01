package com.res.server.backend.controller;

import com.res.server.backend.entity.Payment;
import com.res.server.backend.repository.PaymentRepository;
import com.res.server.backend.service.InvoiceService;
import com.res.server.backend.service.WhatsAppService;
import com.res.server.backend.service.context.LibraryContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER','STAFF')")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PaymentRepository paymentRepository;
    private final WhatsAppService whatsAppService;

    @GetMapping(value = "/{paymentId}.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> invoicePdf(@PathVariable UUID paymentId) {
        byte[] pdf = invoiceService.generateInvoicePdf(paymentId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF); // Set content type to PDF
        headers.setContentDisposition(ContentDisposition.attachment() // Force download with a default filename
                .filename("invoice-" + paymentId + ".pdf")
                .build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdf);
    }

    @PostMapping("/{paymentId}/send-whatsapp")
    public Map<String, String> sendOnWhatsApp(@PathVariable UUID paymentId) {
        UUID libraryId = LibraryContext.getLibraryId();
        if (libraryId == null) {
            throw new IllegalStateException("Library context is not set");
        }

        Payment payment = paymentRepository.findByIdWithStudentAndLibrary(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        if (payment.getLibrary() == null || payment.getLibrary().getId() == null ||
                !payment.getLibrary().getId().equals(libraryId)) {
            throw new IllegalArgumentException("Payment not found");
        }

        String mobile = payment.getStudent() != null ? payment.getStudent().getMobileNo() : null;
        if (mobile == null || mobile.isBlank()) {
            throw new IllegalArgumentException("Student mobile number is missing");
        }

        byte[] pdf = invoiceService.generateInvoicePdf(paymentId);
        String filename = "invoice-" + paymentId + ".pdf";

        String paidAt = payment.getPaidAt() != null
                ? payment.getPaidAt().atZone(ZoneId.systemDefault()).toLocalDate()
                .format(DateTimeFormatter.ofPattern("dd MMM yyyy"))
                : "";

        String caption = "Invoice • " + paidAt + " • Txn: " + paymentId;
        whatsAppService.sendPdfDocument(mobile, pdf, filename, caption);

        return Map.of("status", "sent");
    }
}

