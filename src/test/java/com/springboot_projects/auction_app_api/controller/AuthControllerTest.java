package com.springboot_projects.auction_app_api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot_projects.auction_app_api.dto.*;
import com.springboot_projects.auction_app_api.exception.UnauthorizedException;
import com.springboot_projects.auction_app_api.exception.UserNotFoundException;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.service.AuthService;
import com.springboot_projects.auction_app_api.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private LoginRequest validLoginRequest;
    private CreateUserRequest validCreateUserRequest;
    private JwtResponse jwtResponse;
    private User testUser;

    @BeforeEach
    void setUp() {
        validLoginRequest = new LoginRequest("testuser", "password123");
        
        validCreateUserRequest = new CreateUserRequest();
        validCreateUserRequest.setUsername("newuser");
        validCreateUserRequest.setEmail("newuser@example.com");
        validCreateUserRequest.setPassword("Password123");
        validCreateUserRequest.setFirstName("John");
        validCreateUserRequest.setLastName("Doe");
        validCreateUserRequest.setPhoneNumber("+1234567890");
        validCreateUserRequest.setRoles(Set.of(User.Role.BIDDER));

        testUser = new User();
        testUser.setId("user123");
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRoles(Set.of(User.Role.BIDDER));

        jwtResponse = new JwtResponse(
            "jwt-token-123",
            "user123",
            "testuser",
            "test@example.com",
            Set.of(User.Role.BIDDER)
        );
    }

    @Test
    void login_WithValidCredentials_ShouldReturnJwtResponse() throws Exception {
        // Given
        when(authService.login(any(LoginRequest.class))).thenReturn(jwtResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.token").value("jwt-token-123"))
                .andExpect(jsonPath("$.data.userId").value("user123"))
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    @Test
    void login_WithInvalidCredentials_ShouldReturnUnauthorized() throws Exception {
        // Given
        when(authService.login(any(LoginRequest.class)))
            .thenThrow(new UnauthorizedException("Invalid username/email or password"));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.error").value("UNAUTHORIZED"));
    }

    @Test
    void login_WithInvalidInput_ShouldReturnBadRequest() throws Exception {
        // Given
        LoginRequest invalidRequest = new LoginRequest("", "123"); // Invalid: too short

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.error").value("VALIDATION_FAILED"));
    }

    @Test
    void register_WithValidData_ShouldReturnCreated() throws Exception {
        // Given
        when(userService.createUser(any(User.class))).thenReturn(testUser);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validCreateUserRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    @Test
    void register_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Given
        CreateUserRequest invalidRequest = new CreateUserRequest();
        invalidRequest.setUsername("ab"); // Too short
        invalidRequest.setEmail("invalid-email"); // Invalid format
        invalidRequest.setPassword("123"); // Too weak

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.error").value("VALIDATION_FAILED"));
    }

    @Test
    void validateToken_WithValidToken_ShouldReturnTrue() throws Exception {
        // Given
        when(authService.validateToken(anyString())).thenReturn(true);

        // When & Then
        mockMvc.perform(post("/api/auth/validate")
                .with(csrf())
                .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    void validateToken_WithInvalidHeader_ShouldReturnUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/validate")
                .with(csrf())
                .header("Authorization", "InvalidHeader"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser
    void getCurrentUser_WithValidToken_ShouldReturnUserInfo() throws Exception {
        // Given
        when(authService.extractUsernameFromToken(anyString())).thenReturn("testuser");
        when(userService.getUserByUsername("testuser")).thenReturn(Optional.of(testUser));

        // When & Then
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    @Test
    @WithMockUser
    void getCurrentUser_WithNonExistentUser_ShouldReturnNotFound() throws Exception {
        // Given
        when(authService.extractUsernameFromToken(anyString())).thenReturn("nonexistent");
        when(userService.getUserByUsername("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}