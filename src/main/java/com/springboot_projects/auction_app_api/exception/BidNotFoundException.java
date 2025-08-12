package com.springboot_projects.auction_app_api.exception;

public class BidNotFoundException extends RuntimeException {
    public BidNotFoundException(String message) {
        super(message);
    }
    
    public BidNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}