package com.springboot_projects.auction_app_api.integration;

import com.springboot_projects.auction_app_api.dto.CreateUserRequest;
import com.springboot_projects.auction_app_api.dto.LoginRequest;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Set;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private CreateUserRequest validUserRequest;
    private LoginRequest validLoginRequest;

    @BeforeEach
    void setUpTestData() {
        // Clean database
        userRepository.deleteAll();

        // Prepare test data
        validUserRequest = new CreateUserRequest();
        validUserRequest.setUsername("integrationuser");
        validUserRequest.setEmail("integration@example.com");
        validUserRequest.setPassword("Password123");
        validUserRequest.setFirstName("Integration");
        validUserRequest.setLastName("Test");
        validUserRequest.setPhoneNumber("+1234567890");
        validUserRequest.setRoles(Set.of(User.Role.BIDDER));

        validLoginRequest = new LoginRequest("integrationuser", "Password123");
    }

    @Test
    void fullAuthenticationFlow_ShouldWork() throws Exception {
        // Step 1: Register a new user
        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validUserRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("integrationuser"));

        // Step 2: Login with the registered user
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andReturn();

        // Extract token from response
        String responseContent = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseContent)
                .get("data").get("token").asText();

        // Step 3: Use token to access protected endpoint
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("integrationuser"));

        // Step 4: Validate token
        mockMvc.perform(post("/api/auth/validate")
                .with(csrf())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    void register_WithDuplicateUsername_ShouldFail() throws Exception {
        // Register first user
        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validUserRequest)))
                .andExpect(status().isCreated());

        // Try to register with same username
        CreateUserRequest duplicateRequest = new CreateUserRequest();
        duplicateRequest.setUsername("integrationuser"); // Same username
        duplicateRequest.setEmail("different@example.com");
        duplicateRequest.setPassword("Password123");
        duplicateRequest.setFirstName("Different");
        duplicateRequest.setLastName("User");

        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void login_WithWrongPassword_ShouldFail() throws Exception {
        // Register user first
        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validUserRequest)))
                .andExpect(status().isCreated());

        // Try to login with wrong password
        LoginRequest wrongPasswordRequest = new LoginRequest("integrationuser", "WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongPasswordRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void accessProtectedEndpoint_WithoutToken_ShouldFail() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void accessProtectedEndpoint_WithInvalidToken_ShouldFail() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_WithInvalidData_ShouldReturnValidationErrors() throws Exception {
        CreateUserRequest invalidRequest = new CreateUserRequest();
        invalidRequest.setUsername("ab"); // Too short
        invalidRequest.setEmail("invalid-email"); // Invalid format
        invalidRequest.setPassword("123"); // Too weak

        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.error").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.data.details").isArray());
    }
}