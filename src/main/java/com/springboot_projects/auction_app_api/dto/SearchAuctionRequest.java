package com.springboot_projects.auction_app_api.dto;

import com.springboot_projects.auction_app_api.model.AuctionItem;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

public class SearchAuctionRequest {
    
    private String keyword;
    private String category;
    private AuctionItem.AuctionStatus status;
    
    @DecimalMin(value = "0.0", message = "Minimum price must be non-negative")
    private BigDecimal minPrice;
    
    @DecimalMin(value = "0.0", message = "Maximum price must be non-negative")
    private BigDecimal maxPrice;
    
    private String sellerId;
    private String location;
    
    @Min(value = 0, message = "Page number must be non-negative")
    private int page = 0;
    
    @Min(value = 1, message = "Page size must be at least 1")
    private int size = 10;
    
    private String sortBy = "createdAt";
    private String sortDirection = "desc";
    
    // Constructors
    public SearchAuctionRequest() {}
    
    // Custom validation method
    public boolean isPriceRangeValid() {
        if (minPrice == null || maxPrice == null) {
            return true; // Allow null values
        }
        return maxPrice.compareTo(minPrice) >= 0;
    }
    
    // Getters and Setters
    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public AuctionItem.AuctionStatus getStatus() { return status; }
    public void setStatus(AuctionItem.AuctionStatus status) { this.status = status; }
    
    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }
    
    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }
    
    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    
    public String getSortDirection() { return sortDirection; }
    public void setSortDirection(String sortDirection) { this.sortDirection = sortDirection; }
}