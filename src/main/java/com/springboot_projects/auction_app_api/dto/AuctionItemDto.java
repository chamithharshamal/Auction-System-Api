package com.springboot_projects.auction_app_api.dto;

import com.springboot_projects.auction_app_api.model.AuctionItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AuctionItemDto {
    private String id;
    private String title;
    private String description;
    private String category;
    private List<String> imageUrls;
    private BigDecimal startingPrice;
    private BigDecimal currentPrice;
    private BigDecimal reservePrice;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private UserDto seller;
    private UserDto highestBidder;
    private AuctionItem.AuctionStatus status;
    private int totalBids;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public AuctionItemDto() {}
    
    public AuctionItemDto(AuctionItem auctionItem) {
        this.id = auctionItem.getId();
        this.title = auctionItem.getTitle();
        this.description = auctionItem.getDescription();
        this.category = auctionItem.getCategory();
        this.imageUrls = auctionItem.getImageUrls();
        this.startingPrice = auctionItem.getStartingPrice();
        this.currentPrice = auctionItem.getCurrentPrice();
        this.reservePrice = auctionItem.getReservePrice();
        this.startDate = auctionItem.getStartDate();
        this.endDate = auctionItem.getEndDate();
        this.seller = auctionItem.getSeller() != null ? new UserDto(auctionItem.getSeller()) : null;
        this.highestBidder = auctionItem.getHighestBidder() != null ? new UserDto(auctionItem.getHighestBidder()) : null;
        this.status = auctionItem.getStatus();
        this.totalBids = auctionItem.getTotalBids();
        this.createdAt = auctionItem.getCreatedAt();
        this.updatedAt = auctionItem.getUpdatedAt();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    
    public BigDecimal getStartingPrice() { return startingPrice; }
    public void setStartingPrice(BigDecimal startingPrice) { this.startingPrice = startingPrice; }
    
    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }
    
    public BigDecimal getReservePrice() { return reservePrice; }
    public void setReservePrice(BigDecimal reservePrice) { this.reservePrice = reservePrice; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    
    public UserDto getSeller() { return seller; }
    public void setSeller(UserDto seller) { this.seller = seller; }
    
    public UserDto getHighestBidder() { return highestBidder; }
    public void setHighestBidder(UserDto highestBidder) { this.highestBidder = highestBidder; }
    
    public AuctionItem.AuctionStatus getStatus() { return status; }
    public void setStatus(AuctionItem.AuctionStatus status) { this.status = status; }
    
    public int getTotalBids() { return totalBids; }
    public void setTotalBids(int totalBids) { this.totalBids = totalBids; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}