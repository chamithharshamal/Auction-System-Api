package com.springboot_projects.auction_app_api.exception;

public class InvalidFileException extends RuntimeException {
    public InvalidFileException(String message) {
        super(message);
    }
    
    public InvalidFileException(String message, Throwable cause) {
        super(message, cause);
    }
}