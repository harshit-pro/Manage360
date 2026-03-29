package com.res.server.backend.service;

import java.util.UUID;

public interface InvoiceService {

    byte[] generateInvoicePdf(UUID paymentId);
}

