package com.springboot_projects.auction_app_api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PlaceBidRequest {
    
    @NotBlank(message = "Bidder ID is required")
    private String bidderId;
    
    @NotNull(message = "Bid amount is required")
    @DecimalMin(value = "0.01", message = "Bid amount must be greater than 0")
    private BigDecimal amount;
    
    // Constructors
    public PlaceBidRequest() {}
    
    public PlaceBidRequest(String bidderId, BigDecimal amount) {
        this.bidderId = bidderId;
        this.amount = amount;
    }
    
    // Getters and Setters
    public String getBidderId() { return bidderId; }
    public void setBidderId(String bidderId) { this.bidderId = bidderId; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}