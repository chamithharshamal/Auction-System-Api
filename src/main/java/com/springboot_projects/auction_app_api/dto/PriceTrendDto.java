package com.springboot_projects.auction_app_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PriceTrendDto {
    private BigDecimal amount;
    private LocalDateTime timestamp;
    private String bidderName;

    public PriceTrendDto(BigDecimal amount, LocalDateTime timestamp, String bidderName) {
        this.amount = amount;
        this.timestamp = timestamp;
        this.bidderName = bidderName;
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

    public String getBidderName() {
        return bidderName;
    }

    public void setBidderName(String bidderName) {
        this.bidderName = bidderName;
    }
}
