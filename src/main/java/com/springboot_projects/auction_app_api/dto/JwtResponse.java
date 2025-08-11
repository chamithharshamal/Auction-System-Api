package com.springboot_projects.auction_app_api.dto;

import com.springboot_projects.auction_app_api.model.User;

import java.util.Set;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String userId;
    private String username;
    private String email;
    private Set<User.Role> roles;
    
    // Constructors
    public JwtResponse() {}
    
    public JwtResponse(String token, String userId, String username, String email, Set<User.Role> roles) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }
    
    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Set<User.Role> getRoles() { return roles; }
    public void setRoles(Set<User.Role> roles) { this.roles = roles; }
}