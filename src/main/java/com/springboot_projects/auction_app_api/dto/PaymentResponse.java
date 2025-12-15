package com.springboot_projects.auction_app_api.dto;

import java.time.LocalDateTime;

public class PaymentResponse {

    private String paymentId;
    private String status;
    private String transactionId;
    private String message;
    private LocalDateTime timestamp;

    public PaymentResponse(String paymentId, String status, String transactionId, String message) {
        this.paymentId = paymentId;
        this.status = status;
        this.transactionId = transactionId;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
