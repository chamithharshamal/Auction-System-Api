package com.springboot_projects.auction_app_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidNotification {
    
    private String auctionId;
    private String bidId;
    private String bidderUsername;
    private BigDecimal bidAmount;
    private BigDecimal previousHighestBid;
    private LocalDateTime bidTime;
    private int totalBids;
    private String message;
    private NotificationType type;
    
    public enum NotificationType {
        NEW_BID, BID_OUTBID, AUCTION_ENDING_SOON, AUCTION_ENDED, BID_WON
    }
    
    // Constructors
    public BidNotification() {}
    
    public BidNotification(String auctionId, String bidId, String bidderUsername, 
                          BigDecimal bidAmount, NotificationType type) {
        this.auctionId = auctionId;
        this.bidId = bidId;
        this.bidderUsername = bidderUsername;
        this.bidAmount = bidAmount;
        this.type = type;
        this.bidTime = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getAuctionId() { return auctionId; }
    public void setAuctionId(String auctionId) { this.auctionId = auctionId; }
    
    public String getBidId() { return bidId; }
    public void setBidId(String bidId) { this.bidId = bidId; }
    
    public String getBidderUsername() { return bidderUsername; }
    public void setBidderUsername(String bidderUsername) { this.bidderUsername = bidderUsername; }
    
    public BigDecimal getBidAmount() { return bidAmount; }
    public void setBidAmount(BigDecimal bidAmount) { this.bidAmount = bidAmount; }
    
    public BigDecimal getPreviousHighestBid() { return previousHighestBid; }
    public void setPreviousHighestBid(BigDecimal previousHighestBid) { this.previousHighestBid = previousHighestBid; }
    
    public LocalDateTime getBidTime() { return bidTime; }
    public void setBidTime(LocalDateTime bidTime) { this.bidTime = bidTime; }
    
    public int getTotalBids() { return totalBids; }
    public void setTotalBids(int totalBids) { this.totalBids = totalBids; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
}