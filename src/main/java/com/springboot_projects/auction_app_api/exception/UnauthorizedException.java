package com.springboot_projects.auction_app_api.exception;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
    
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}