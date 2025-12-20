package com.springboot_projects.auction_app_api.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class SellerAnalyticsResponse {
    private BigDecimal totalEarnings;
    private long totalAuctions;
    private long activeListings;
    private long soldItems;
    private double successRate;
    private long totalBidsReceived;
    private List<DailySales> salesHistory;
    private Map<String, Long> categoryDistribution;

    public static class DailySales {
        private String date;
        private BigDecimal amount;
        private long count;

        public DailySales(String date, BigDecimal amount, long count) {
            this.date = date;
            this.amount = amount;
            this.count = count;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }
    }

    // Getters and Setters
    public BigDecimal getTotalEarnings() {
        return totalEarnings;
    }

    public void setTotalEarnings(BigDecimal totalEarnings) {
        this.totalEarnings = totalEarnings;
    }

    public long getTotalAuctions() {
        return totalAuctions;
    }

    public void setTotalAuctions(long totalAuctions) {
        this.totalAuctions = totalAuctions;
    }

    public long getActiveListings() {
        return activeListings;
    }

    public void setActiveListings(long activeListings) {
        this.activeListings = activeListings;
    }

    public long getSoldItems() {
        return soldItems;
    }

    public void setSoldItems(long soldItems) {
        this.soldItems = soldItems;
    }

    public double getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(double successRate) {
        this.successRate = successRate;
    }

    public long getTotalBidsReceived() {
        return totalBidsReceived;
    }

    public void setTotalBidsReceived(long totalBidsReceived) {
        this.totalBidsReceived = totalBidsReceived;
    }

    public List<DailySales> getSalesHistory() {
        return salesHistory;
    }

    public void setSalesHistory(List<DailySales> salesHistory) {
        this.salesHistory = salesHistory;
    }

    public Map<String, Long> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(Map<String, Long> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }
}
