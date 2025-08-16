package com.springboot_projects.auction_app_api.dto;

import java.time.LocalDateTime;

public class FileUploadResponse {
    
    private String fileName;
    private String originalFileName;
    private long fileSize;
    private String contentType;
    private String fileUrl;
    private LocalDateTime uploadTime;
    
    // Constructors
    public FileUploadResponse() {}
    
    public FileUploadResponse(String fileName, String originalFileName, long fileSize, 
                            String contentType, String fileUrl, LocalDateTime uploadTime) {
        this.fileName = fileName;
        this.originalFileName = originalFileName;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.fileUrl = fileUrl;
        this.uploadTime = uploadTime;
    }
    
    // Getters and Setters
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    
    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    
    public LocalDateTime getUploadTime() { return uploadTime; }
    public void setUploadTime(LocalDateTime uploadTime) { this.uploadTime = uploadTime; }
}