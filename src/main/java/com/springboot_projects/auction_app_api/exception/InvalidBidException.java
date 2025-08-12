package com.springboot_projects.auction_app_api.exception;

public class InvalidBidException extends RuntimeException {
    public InvalidBidException(String message) {
        super(message);
    }
    
    public InvalidBidException(String message, Throwable cause) {
        super(message, cause);
    }
}