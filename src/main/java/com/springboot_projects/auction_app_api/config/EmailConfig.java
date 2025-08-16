package com.springboot_projects.auction_app_api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.email")
public class EmailConfig {
    
    private String fromEmail = "noreply@auctionapp.com";
    private String fromName = "Auction App";
    private boolean enabled = true;
    private String baseUrl = "http://localhost:8080";
    
    // Getters and Setters
    public String getFromEmail() { return fromEmail; }
    public void setFromEmail(String fromEmail) { this.fromEmail = fromEmail; }
    
    public String getFromName() { return fromName; }
    public void setFromName(String fromName) { this.fromName = fromName; }
    
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    
    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
}