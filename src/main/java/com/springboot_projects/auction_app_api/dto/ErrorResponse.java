package com.springboot_projects.auction_app_api.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ErrorResponse {
    private String error;
    private String message;
    private int status;
    private String path;
    private LocalDateTime timestamp;
    private List<String> details;
    
    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ErrorResponse(String error, String message, int status, String path) {
        this();
        this.error = error;
        this.message = message;
        this.status = status;
        this.path = path;
    }
    
    public ErrorResponse(String error, String message, int status, String path, List<String> details) {
        this(error, message, status, path);
        this.details = details;
    }
    
    // Getters and Setters
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public List<String> getDetails() { return details; }
    public void setDetails(List<String> details) { this.details = details; }
}