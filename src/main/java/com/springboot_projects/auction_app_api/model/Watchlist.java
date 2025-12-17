package com.springboot_projects.auction_app_api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "watchlist")
public class Watchlist {

    @Id
    private String id;

    @DBRef
    private User user;

    @DBRef
    private AuctionItem auctionItem;

    private LocalDateTime createdAt;

    public Watchlist() {
        this.createdAt = LocalDateTime.now();
    }

    public Watchlist(User user, AuctionItem auctionItem) {
        this();
        this.user = user;
        this.auctionItem = auctionItem;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public AuctionItem getAuctionItem() {
        return auctionItem;
    }

    public void setAuctionItem(AuctionItem auctionItem) {
        this.auctionItem = auctionItem;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
