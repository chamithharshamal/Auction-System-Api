package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.dto.JwtResponse;
import com.springboot_projects.auction_app_api.dto.LoginRequest;
import com.springboot_projects.auction_app_api.exception.UnauthorizedException;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.security.CustomUserDetails;
import com.springboot_projects.auction_app_api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    public JwtResponse login(LoginRequest loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()));

            // Get user details
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            // Create additional claims for JWT
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            claims.put("email", user.getEmail());
            claims.put("roles", user.getRoles().stream()
                    .map(Enum::name)
                    .collect(Collectors.toList()));

            // Generate JWT token
            String token = jwtUtil.generateToken(userDetails, claims);

            // Return JWT response
            return new JwtResponse(
                    token,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRoles());

        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid username/email or password");
        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Authentication failed: " + e.getMessage());
        }
    }

    public boolean validateToken(String token) {
        return jwtUtil.isTokenValid(token);
    }

    public String extractUsernameFromToken(String token) {
        return jwtUtil.extractUsername(token);
    }

    public String extractUserIdFromToken(String token) {
        return jwtUtil.extractUserId(token);
    }

    public List<String> extractRolesFromToken(String token) {
        return jwtUtil.extractRoles(token);
    }
}