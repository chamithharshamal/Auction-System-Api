package com.springboot_projects.auction_app_api.dto;

import com.springboot_projects.auction_app_api.model.User;

import java.util.Set;

public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Set<User.Role> roles;
    
    // Constructors
    public UpdateUserRequest() {}
    
    // Getters and Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public Set<User.Role> getRoles() { return roles; }
    public void setRoles(Set<User.Role> roles) { this.roles = roles; }
}