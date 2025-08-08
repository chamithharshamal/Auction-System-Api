package com.springboot_projects.auction_app_api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "bids")
public class Bid {
    
    @Id
    private String id;
    
    private BigDecimal amount;
    private LocalDateTime timestamp;
    
    @DBRef
    private User bidder;
    
    @DBRef
    private AuctionItem auctionItem;
    
    private BidStatus status;
    private String notes;
    
    public enum BidStatus {
        ACTIVE, OUTBID, WINNING, CANCELLED
    }
    
    // Constructors
    public Bid() {
        this.timestamp = LocalDateTime.now();
        this.status = BidStatus.ACTIVE;
    }
    
    public Bid(BigDecimal amount, User bidder, AuctionItem auctionItem) {
        this();
        this.amount = amount;
        this.bidder = bidder;
        this.auctionItem = auctionItem;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public User getBidder() {
        return bidder;
    }
    
    public void setBidder(User bidder) {
        this.bidder = bidder;
    }
    
    public AuctionItem getAuctionItem() {
        return auctionItem;
    }
    
    public void setAuctionItem(AuctionItem auctionItem) {
        this.auctionItem = auctionItem;
    }
    
    public BidStatus getStatus() {
        return status;
    }
    
    public void setStatus(BidStatus status) {
        this.status = status;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    // Helper methods
    public boolean isValid() {
        return amount != null && 
               amount.compareTo(BigDecimal.ZERO) > 0 && 
               bidder != null && 
               auctionItem != null;
    }
    
    public boolean isHigherThan(BigDecimal compareAmount) {
        return amount.compareTo(compareAmount) > 0;
    }
}