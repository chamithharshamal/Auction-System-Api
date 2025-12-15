package com.springboot_projects.auction_app_api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "auction_items")
public class AuctionItem {

    @Id
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

    @DBRef
    private User seller;

    @DBRef
    private User highestBidder;

    private AuctionStatus status;
    private int totalBids;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private boolean paid;

    public enum AuctionStatus {
        DRAFT, ACTIVE, ENDED, CANCELLED
    }

    // Constructors
    public AuctionItem() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = AuctionStatus.DRAFT;
        this.totalBids = 0;
    }

    public AuctionItem(String title, String description, BigDecimal startingPrice,
            LocalDateTime startDate, LocalDateTime endDate, User seller) {
        this();
        this.title = title;
        this.description = description;
        this.startingPrice = startingPrice;
        this.currentPrice = startingPrice;
        this.startDate = startDate;
        this.endDate = endDate;
        this.seller = seller;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public BigDecimal getStartingPrice() {
        return startingPrice;
    }

    public void setStartingPrice(BigDecimal startingPrice) {
        this.startingPrice = startingPrice;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public BigDecimal getReservePrice() {
        return reservePrice;
    }

    public void setReservePrice(BigDecimal reservePrice) {
        this.reservePrice = reservePrice;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public User getSeller() {
        return seller;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }

    public User getHighestBidder() {
        return highestBidder;
    }

    public void setHighestBidder(User highestBidder) {
        this.highestBidder = highestBidder;
    }

    public AuctionStatus getStatus() {
        return status;
    }

    public void setStatus(AuctionStatus status) {
        this.status = status;
    }

    public int getTotalBids() {
        return totalBids;
    }

    public void setTotalBids(int totalBids) {
        this.totalBids = totalBids;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Helper methods
    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        return status == AuctionStatus.ACTIVE &&
                now.isAfter(startDate) &&
                now.isBefore(endDate);
    }

    public boolean hasEnded() {
        return LocalDateTime.now().isAfter(endDate) || status == AuctionStatus.ENDED;
    }

    public boolean isPaid() {
        return paid;
    }

    public void setPaid(boolean paid) {
        this.paid = paid;
    }
}