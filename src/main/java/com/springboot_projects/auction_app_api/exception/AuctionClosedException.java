package com.springboot_projects.auction_app_api.exception;

public class AuctionClosedException extends RuntimeException {
    public AuctionClosedException(String message) {
        super(message);
    }
    
    public AuctionClosedException(String message, Throwable cause) {
        super(message, cause);
    }
}