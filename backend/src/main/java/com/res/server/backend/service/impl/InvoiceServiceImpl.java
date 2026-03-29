package com.res.server.backend.service.impl;

import com.res.server.backend.entity.Library;
import com.res.server.backend.entity.Payment;
import com.res.server.backend.entity.Student;
import com.res.server.backend.repository.LibraryRepository;
import com.res.server.backend.repository.PaymentRepository;
import com.res.server.backend.service.InvoiceService;
import com.res.server.backend.service.context.LibraryContext;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final PaymentRepository paymentRepository;
    private final LibraryRepository libraryRepository;

    private static final Color TEAL        = new Color(15, 118, 110);   // primary brand
    private static final Color DARK_TEXT   = new Color(30, 41, 59);
    private static final Color GRAY_TEXT   = new Color(100, 116, 139);
    private static final Color LIGHT_BG    = new Color(240, 253, 250);  // very light teal
    private static final Color BORDER_GRAY = new Color(226, 232, 240);
    private static final Color WHITE       = new Color(255, 255, 255);

    @Override
    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(UUID paymentId) {
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

        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalArgumentException("Library not found"));

        Student student = payment.getStudent();
        if (student == null) {
            throw new IllegalStateException("Payment has no student");
        }

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        String paidAt = payment.getPaidAt() != null
                ? payment.getPaidAt().atZone(ZoneId.systemDefault()).toLocalDate().format(dateFmt)
                : "";

        // Build membership period string
        String periodFrom = "";
        String periodTo = "";
        String durationLabel = "";
        if (payment.getPeriodStart() != null && payment.getPeriodEnd() != null) {
            periodFrom = payment.getPeriodStart().format(dateFmt);
            periodTo = payment.getPeriodEnd().format(dateFmt);
            long months = ChronoUnit.MONTHS.between(payment.getPeriodStart(), payment.getPeriodEnd());
            if (months <= 0) months = 1;
            durationLabel = months + (months == 1 ? " Month" : " Months");
        }

        String amountStr = "Rs. " + (payment.getAmount() != null ? String.format("%,d", payment.getAmount()) : "0");

        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font fontItalic = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float margin = 50;
                float contentWidth = pageWidth - 2 * margin;
                float y = pageHeight - margin;

                // ── Header band (teal stripe) ──
                cs.setNonStrokingColor(TEAL);
                cs.addRect(0, pageHeight - 80, pageWidth, 80);
                cs.fill();

                // Title text
                cs.beginText();
                cs.setFont(fontBold, 22);
                cs.setNonStrokingColor(WHITE);
                cs.newLineAtOffset(margin, pageHeight - 52);
                cs.showText("INVOICE");
                cs.endText();

                // Institute name on the right
                String instName = library.getName() != null ? library.getName() : "";
                float instWidth = fontRegular.getStringWidth(instName) / 1000 * 11;
                cs.beginText();
                cs.setFont(fontRegular, 11);
                cs.setNonStrokingColor(WHITE);
                cs.newLineAtOffset(pageWidth - margin - instWidth, pageHeight - 50);
                cs.showText(instName);
                cs.endText();

                // "Powered by Manage360" below institute
                String poweredBy = "Powered by Manage360";
                float poweredWidth = fontItalic.getStringWidth(poweredBy) / 1000 * 8;
                cs.beginText();
                cs.setFont(fontItalic, 8);
                cs.newLineAtOffset(pageWidth - margin - poweredWidth, pageHeight - 63);
                cs.showText(poweredBy);
                cs.endText();

                y = pageHeight - 110;

                // ── Invoice meta row ──
                cs.setNonStrokingColor(GRAY_TEXT);
                cs.beginText();
                cs.setFont(fontRegular, 9);
                cs.newLineAtOffset(margin, y);
                cs.showText("Invoice No: " + paymentId.toString().substring(0, 8).toUpperCase());
                cs.endText();

                String dateLabel = "Date: " + paidAt;
                float dateWidth = fontRegular.getStringWidth(dateLabel) / 1000 * 9;
                cs.beginText();
                cs.setFont(fontRegular, 9);
                cs.newLineAtOffset(pageWidth - margin - dateWidth, y);
                cs.showText(dateLabel);
                cs.endText();

                y -= 8;
                // thin separator line
                cs.setStrokingColor(BORDER_GRAY);
                cs.setLineWidth(0.5f);
                cs.moveTo(margin, y);
                cs.lineTo(pageWidth - margin, y);
                cs.stroke();

                y -= 28;

                // ── Membership Period Section (prominent) ──
                if (!periodFrom.isEmpty()) {
                    // Light teal background box
                    float boxHeight = 72;
                    cs.setNonStrokingColor(LIGHT_BG);
                    cs.addRect(margin, y - boxHeight + 14, contentWidth, boxHeight);
                    cs.fill();

                    // Border around box
                    cs.setStrokingColor(TEAL);
                    cs.setLineWidth(1.2f);
                    cs.addRect(margin, y - boxHeight + 14, contentWidth, boxHeight);
                    cs.stroke();

                    // "MEMBERSHIP PERIOD" label
                    cs.beginText();
                    cs.setFont(fontBold, 10);
                    cs.setNonStrokingColor(TEAL);
                    cs.newLineAtOffset(margin + 16, y);
                    cs.showText("MEMBERSHIP PERIOD");
                    cs.endText();

                    // Duration badge on the right
                    if (!durationLabel.isEmpty()) {
                        float durationWidth = fontBold.getStringWidth(durationLabel) / 1000 * 10;
                        float badgeX = pageWidth - margin - durationWidth - 28;
                        // Badge background
                        cs.setNonStrokingColor(TEAL);
                        cs.addRect(badgeX, y - 4, durationWidth + 20, 18);
                        cs.fill();
                        // Badge text
                        cs.beginText();
                        cs.setFont(fontBold, 10);
                        cs.setNonStrokingColor(WHITE);
                        cs.newLineAtOffset(badgeX + 10, y);
                        cs.showText(durationLabel);
                        cs.endText();
                    }

                    y -= 22;

                    // "Fees Paid From" line
                    cs.beginText();
                    cs.setFont(fontRegular, 11);
                    cs.setNonStrokingColor(DARK_TEXT);
                    cs.newLineAtOffset(margin + 16, y);
                    cs.showText("Fees Paid From:  ");
                    cs.endText();

                    float fromLabelW = fontRegular.getStringWidth("Fees Paid From:  ") / 1000 * 11;
                    cs.beginText();
                    cs.setFont(fontBold, 12);
                    cs.setNonStrokingColor(TEAL);
                    cs.newLineAtOffset(margin + 16 + fromLabelW, y);
                    cs.showText(periodFrom);
                    cs.endText();

                    y -= 18;

                    // "To" line
                    cs.beginText();
                    cs.setFont(fontRegular, 11);
                    cs.setNonStrokingColor(DARK_TEXT);
                    cs.newLineAtOffset(margin + 16, y);
                    cs.showText("To:  ");
                    cs.endText();

                    float toLabelW = fontRegular.getStringWidth("To:  ") / 1000 * 11;
                    cs.beginText();
                    cs.setFont(fontBold, 12);
                    cs.setNonStrokingColor(TEAL);
                    cs.newLineAtOffset(margin + 16 + toLabelW, y);
                    cs.showText(periodTo);
                    cs.endText();

                    y -= 36;
                } else {
                    y -= 6;
                }

                // ── Student Details Section ──
                cs.beginText();
                cs.setFont(fontBold, 12);
                cs.setNonStrokingColor(DARK_TEXT);
                cs.newLineAtOffset(margin, y);
                cs.showText("STUDENT DETAILS");
                cs.endText();

                y -= 6;
                cs.setStrokingColor(TEAL);
                cs.setLineWidth(1.5f);
                cs.moveTo(margin, y);
                cs.lineTo(margin + 120, y);
                cs.stroke();

                y -= 20;
                drawLabelValue(cs, fontRegular, fontBold, margin, y, "Name",
                        student.getName() != null ? student.getName() : "");
                y -= 18;
                drawLabelValue(cs, fontRegular, fontBold, margin, y, "Reg No",
                        student.getRegNo() != null ? student.getRegNo() : "");
                y -= 18;
                drawLabelValue(cs, fontRegular, fontBold, margin, y, "Seat No",
                        student.getSeatNo() != null ? student.getSeatNo() : "-");
                y -= 18;
                drawLabelValue(cs, fontRegular, fontBold, margin, y, "Mobile",
                        student.getMobileNo() != null ? student.getMobileNo() : "-");

                y -= 32;

                // ── Payment Details Section ──
                cs.beginText();
                cs.setFont(fontBold, 12);
                cs.setNonStrokingColor(DARK_TEXT);
                cs.newLineAtOffset(margin, y);
                cs.showText("PAYMENT DETAILS");
                cs.endText();

                y -= 6;
                cs.setStrokingColor(TEAL);
                cs.setLineWidth(1.5f);
                cs.moveTo(margin, y);
                cs.lineTo(margin + 120, y);
                cs.stroke();

                y -= 20;
                String paymentType = payment.getType() != null
                        ? payment.getType().name().replace("_", " ")
                        : "";
                drawLabelValue(cs, fontRegular, fontBold, margin, y, "Type", paymentType);
                y -= 18;
                String paymentMethod = payment.getMethod() != null
                        ? payment.getMethod().name()
                        : "";
                drawLabelValue(cs, fontRegular, fontBold, margin, y, "Method", paymentMethod);
                y -= 18;
                drawLabelValue(cs, fontRegular, fontBold, margin, y, "Date", paidAt);
                y -= 18;
                drawLabelValue(cs, fontRegular, fontBold, margin, y, "Transaction ID",
                        payment.getId().toString());

                y -= 40;

                // ── Amount Box ──
                float amountBoxHeight = 50;
                cs.setNonStrokingColor(TEAL);
                cs.addRect(margin, y - amountBoxHeight + 20, contentWidth, amountBoxHeight);
                cs.fill();

                // "TOTAL AMOUNT" label
                cs.beginText();
                cs.setFont(fontBold, 10);
                cs.setNonStrokingColor(WHITE);
                cs.newLineAtOffset(margin + 20, y);
                cs.showText("TOTAL AMOUNT");
                cs.endText();

                // Amount on the right
                float amtWidth = fontBold.getStringWidth(amountStr) / 1000 * 20;
                cs.beginText();
                cs.setFont(fontBold, 20);
                cs.setNonStrokingColor(WHITE);
                cs.newLineAtOffset(pageWidth - margin - amtWidth - 20, y - 4);
                cs.showText(amountStr);
                cs.endText();

                // ── Footer ──
                float footerY = 60;
                cs.setStrokingColor(BORDER_GRAY);
                cs.setLineWidth(0.5f);
                cs.moveTo(margin, footerY);
                cs.lineTo(pageWidth - margin, footerY);
                cs.stroke();

                cs.beginText();
                cs.setFont(fontItalic, 8);
                cs.setNonStrokingColor(GRAY_TEXT);
                cs.newLineAtOffset(margin, footerY - 14);
                cs.showText("This is a computer-generated invoice. No signature required.");
                cs.endText();

                String genDate = "Generated on " + LocalDate.now().format(dateFmt);
                float genWidth = fontRegular.getStringWidth(genDate) / 1000 * 8;
                cs.beginText();
                cs.setFont(fontRegular, 8);
                cs.newLineAtOffset(pageWidth - margin - genWidth, footerY - 14);
                cs.showText(genDate);
                cs.endText();
            }

            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                doc.save(baos);
                return baos.toByteArray();
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate invoice PDF", e);
        }
    }

    /** Helper: draws "Label:   Value" pair at given position */
    private void drawLabelValue(PDPageContentStream cs, PDType1Font fontRegular,
                                PDType1Font fontBold, float x, float y,
                                String label, String value) throws java.io.IOException {
        cs.beginText();
        cs.setFont(fontRegular, 10);
        cs.setNonStrokingColor(GRAY_TEXT);
        cs.newLineAtOffset(x, y);
        cs.showText(label + ":  ");
        cs.endText();

        float labelW = fontRegular.getStringWidth(label + ":  ") / 1000 * 10;
        cs.beginText();
        cs.setFont(fontBold, 10);
        cs.setNonStrokingColor(DARK_TEXT);
        cs.newLineAtOffset(x + labelW, y);
        cs.showText(value);
        cs.endText();
    }
}
