package com.springboot_projects.auction_app_api.dto;

import java.math.BigDecimal;

public class PlaceBidRequest {
    private BigDecimal amount;
    private String bidderId;
    private String notes;
    
    // Constructors
    public PlaceBidRequest() {}
    
    // Getters and Setters
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getBidderId() { return bidderId; }
    public void setBidderId(String bidderId) { this.bidderId = bidderId; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}