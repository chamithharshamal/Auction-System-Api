package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.dto.*;
import com.springboot_projects.auction_app_api.exception.UnauthorizedException;
import com.springboot_projects.auction_app_api.exception.UserNotFoundException;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.service.AuthService;
import com.springboot_projects.auction_app_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserService userService;
    
    // User login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", jwtResponse));
    }
    
    // User registration
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody CreateUserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        // Set default role if none provided
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            user.setRoles(Set.of(User.Role.BIDDER));
        } else {
            user.setRoles(request.getRoles());
        }
        
        User createdUser = userService.createUser(user);
        UserDto userDto = new UserDto(createdUser);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", userDto));
    }
    
    // Validate token
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid authorization header format");
        }
        
        String token = authHeader.substring(7);
        boolean isValid = authService.validateToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token validation completed", isValid));
    }
    
    // Get current user info from token
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid authorization header format");
        }
        
        String token = authHeader.substring(7);
        String username = authService.extractUsernameFromToken(token);
        
        var user = userService.getUserByUsername(username);
        if (user.isPresent()) {
            UserDto userDto = new UserDto(user.get());
            return ResponseEntity.ok(ApiResponse.success("Current user info", userDto));
        } else {
            throw new UserNotFoundException("User not found: " + username);
        }
    }
    
    // Refresh token (optional - for future implementation)
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        // Implementation for token refresh can be added here
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Token refresh not implemented yet"));
    }
}