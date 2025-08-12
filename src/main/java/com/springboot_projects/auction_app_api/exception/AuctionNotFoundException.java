package com.springboot_projects.auction_app_api.exception;

public class AuctionNotFoundException extends RuntimeException {
    public AuctionNotFoundException(String message) {
        super(message);
    }
    
    public AuctionNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}