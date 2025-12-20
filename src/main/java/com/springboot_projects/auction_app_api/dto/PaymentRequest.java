package com.springboot_projects.auction_app_api.dto;

import jakarta.validation.constraints.NotBlank;

public class PaymentRequest {

    @NotBlank(message = "Auction ID is required")
    private String auctionId;

    private String cardNumber;
    private String expiryDate;
    private String cvv;

    // New fields for PayPal
    private String paymentMethod; // "CARD" or "PAYPAL"
    private String paypalOrderId;

    // Shipping details
    private String shippingName;
    private String shippingAddress;
    private String shippingPhoneNumber;
    private String city;
    private String zipCode;
    private String country;
    private java.math.BigDecimal deliveryCharge;
    private java.math.BigDecimal totalAmount;

    // Getters and Setters
    public String getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(String auctionId) {
        this.auctionId = auctionId;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getCvv() {
        return cvv;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaypalOrderId() {
        return paypalOrderId;
    }

    public void setPaypalOrderId(String paypalOrderId) {
        this.paypalOrderId = paypalOrderId;
    }

    public String getShippingName() {
        return shippingName;
    }

    public void setShippingName(String shippingName) {
        this.shippingName = shippingName;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getShippingPhoneNumber() {
        return shippingPhoneNumber;
    }

    public void setShippingPhoneNumber(String shippingPhoneNumber) {
        this.shippingPhoneNumber = shippingPhoneNumber;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public java.math.BigDecimal getDeliveryCharge() {
        return deliveryCharge;
    }

    public void setDeliveryCharge(java.math.BigDecimal deliveryCharge) {
        this.deliveryCharge = deliveryCharge;
    }

    public java.math.BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(java.math.BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
