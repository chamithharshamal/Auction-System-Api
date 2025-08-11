package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.dto.*;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.service.AuthService;
import com.springboot_projects.auction_app_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ApiResponse<JwtResponse>> login(@RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse jwtResponse = authService.login(loginRequest);
            return ResponseEntity.ok(ApiResponse.success("Login successful", jwtResponse));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // User registration
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@RequestBody CreateUserRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setRoles(request.getRoles());
            
            User createdUser = userService.createUser(user);
            UserDto userDto = new UserDto(createdUser);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User registered successfully", userDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Validate token
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                boolean isValid = authService.validateToken(token);
                return ResponseEntity.ok(ApiResponse.success("Token validation completed", isValid));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid authorization header format"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get current user info from token
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = authService.extractUsernameFromToken(token);
                
                var user = userService.getUserByUsername(username);
                if (user.isPresent()) {
                    UserDto userDto = new UserDto(user.get());
                    return ResponseEntity.ok(ApiResponse.success("Current user info", userDto));
                } else {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.error("User not found"));
                }
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid authorization header format"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Refresh token (optional - for future implementation)
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            // Implementation for token refresh can be added here
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                    .body(ApiResponse.error("Token refresh not implemented yet"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}