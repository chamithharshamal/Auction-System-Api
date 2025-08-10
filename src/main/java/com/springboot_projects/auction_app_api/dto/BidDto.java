package com.springboot_projects.auction_app_api.dto;

import com.springboot_projects.auction_app_api.model.Bid;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidDto {
    private String id;
    private BigDecimal amount;
    private LocalDateTime timestamp;
    private UserDto bidder;
    private String auctionItemId;
    private String auctionItemTitle;
    private Bid.BidStatus status;
    private String notes;
    
    // Constructors
    public BidDto() {}
    
    public BidDto(Bid bid) {
        this.id = bid.getId();
        this.amount = bid.getAmount();
        this.timestamp = bid.getTimestamp();
        this.bidder = bid.getBidder() != null ? new UserDto(bid.getBidder()) : null;
        this.auctionItemId = bid.getAuctionItem() != null ? bid.getAuctionItem().getId() : null;
        this.auctionItemTitle = bid.getAuctionItem() != null ? bid.getAuctionItem().getTitle() : null;
        this.status = bid.getStatus();
        this.notes = bid.getNotes();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public UserDto getBidder() { return bidder; }
    public void setBidder(UserDto bidder) { this.bidder = bidder; }
    
    public String getAuctionItemId() { return auctionItemId; }
    public void setAuctionItemId(String auctionItemId) { this.auctionItemId = auctionItemId; }
    
    public String getAuctionItemTitle() { return auctionItemTitle; }
    public void setAuctionItemTitle(String auctionItemTitle) { this.auctionItemTitle = auctionItemTitle; }
    
    public Bid.BidStatus getStatus() { return status; }
    public void setStatus(Bid.BidStatus status) { this.status = status; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}