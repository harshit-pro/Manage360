package com.res.server.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, Object> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        return Map.of(
                "timestamp", Instant.now(),
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", "Validation Failed",
                "message", ex.getBindingResult().getFieldError().getDefaultMessage(),
                "path", request.getRequestURI()
        );
    }

    @ExceptionHandler(Exception.class)
    public Map<String, Object> handleGeneral(
            Exception ex,
            HttpServletRequest request
    ) {
        return Map.of(
                "timestamp", Instant.now(),
                "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "error", "Internal Error",
                "message", ex.getMessage(),
                "path", request.getRequestURI()
        );
    }
}