package com.springboot_projects.auction_app_api.security;

import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> user = userRepository.findByUsernameOrEmail(username, username);
        
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with username or email: " + username);
        }
        
        return new CustomUserDetails(user.get());
    }
    
    // Load user by ID (useful for JWT token validation)
    public UserDetails loadUserById(String userId) throws UsernameNotFoundException {
        Optional<User> user = userRepository.findById(userId);
        
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with id: " + userId);
        }
        
        return new CustomUserDetails(user.get());
    }
}