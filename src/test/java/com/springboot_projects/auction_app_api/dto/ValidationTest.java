package com.springboot_projects.auction_app_api.dto;

import com.springboot_projects.auction_app_api.model.User;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class ValidationTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void loginRequest_WithValidData_ShouldPassValidation() {
        // Given
        LoginRequest request = new LoginRequest("testuser", "password123");

        // When
        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        // Then
        assertTrue(violations.isEmpty());
    }

    @Test
    void loginRequest_WithBlankUsername_ShouldFailValidation() {
        // Given
        LoginRequest request = new LoginRequest("", "password123");

        // When
        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Username or email is required")));
    }

    @Test
    void loginRequest_WithShortPassword_ShouldFailValidation() {
        // Given
        LoginRequest request = new LoginRequest("testuser", "123");

        // When
        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Password must be at least 6 characters")));
    }

    @Test
    void createUserRequest_WithValidData_ShouldPassValidation() {
        // Given
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("Password123");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhoneNumber("+1234567890");
        request.setRoles(Set.of(User.Role.BIDDER));

        // When
        Set<ConstraintViolation<CreateUserRequest>> violations = validator.validate(request);

        // Then
        assertTrue(violations.isEmpty());
    }

    @Test
    void createUserRequest_WithInvalidEmail_ShouldFailValidation() {
        // Given
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("testuser");
        request.setEmail("invalid-email");
        request.setPassword("Password123");
        request.setFirstName("John");
        request.setLastName("Doe");

        // When
        Set<ConstraintViolation<CreateUserRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Please provide a valid email address")));
    }

    @Test
    void createUserRequest_WithWeakPassword_ShouldFailValidation() {
        // Given
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("password"); // No uppercase or digit
        request.setFirstName("John");
        request.setLastName("Doe");

        // When
        Set<ConstraintViolation<CreateUserRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Password must contain at least one lowercase letter, one uppercase letter, and one digit")));
    }

    @Test
    void createUserRequest_WithInvalidUsername_ShouldFailValidation() {
        // Given
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("test@user"); // Contains invalid character
        request.setEmail("test@example.com");
        request.setPassword("Password123");
        request.setFirstName("John");
        request.setLastName("Doe");

        // When
        Set<ConstraintViolation<CreateUserRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Username can only contain letters, numbers, and underscores")));
    }

    @Test
    void placeBidRequest_WithValidData_ShouldPassValidation() {
        // Given
        PlaceBidRequest request = new PlaceBidRequest("bidder123", new BigDecimal("100.50"));

        // When
        Set<ConstraintViolation<PlaceBidRequest>> violations = validator.validate(request);

        // Then
        assertTrue(violations.isEmpty());
    }

    @Test
    void placeBidRequest_WithZeroAmount_ShouldFailValidation() {
        // Given
        PlaceBidRequest request = new PlaceBidRequest("bidder123", BigDecimal.ZERO);

        // When
        Set<ConstraintViolation<PlaceBidRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Bid amount must be greater than 0")));
    }

    @Test
    void createAuctionRequest_WithValidData_ShouldPassValidation() {
        // Given
        CreateAuctionRequest request = new CreateAuctionRequest();
        request.setTitle("Test Auction Item");
        request.setDescription("This is a test auction item for validation testing");
        request.setCategory("Electronics");
        request.setStartingPrice(new BigDecimal("50.00"));
        request.setReservePrice(new BigDecimal("100.00"));
        request.setStartDate(LocalDateTime.now().plusDays(1));
        request.setEndDate(LocalDateTime.now().plusDays(7));
        request.setSellerId("seller123");

        // When
        Set<ConstraintViolation<CreateAuctionRequest>> violations = validator.validate(request);

        // Then
        assertTrue(violations.isEmpty());
    }

    @Test
    void createAuctionRequest_WithShortTitle_ShouldFailValidation() {
        // Given
        CreateAuctionRequest request = new CreateAuctionRequest();
        request.setTitle("Test"); // Too short
        request.setDescription("This is a test auction item");
        request.setCategory("Electronics");
        request.setStartingPrice(new BigDecimal("50.00"));
        request.setReservePrice(new BigDecimal("100.00"));
        request.setStartDate(LocalDateTime.now().plusDays(1));
        request.setEndDate(LocalDateTime.now().plusDays(7));
        request.setSellerId("seller123");

        // When
        Set<ConstraintViolation<CreateAuctionRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Title must be between 5 and 200 characters")));
    }

    @Test
    void createAuctionRequest_WithPastStartDate_ShouldFailValidation() {
        // Given
        CreateAuctionRequest request = new CreateAuctionRequest();
        request.setTitle("Test Auction Item");
        request.setDescription("This is a test auction item");
        request.setCategory("Electronics");
        request.setStartingPrice(new BigDecimal("50.00"));
        request.setReservePrice(new BigDecimal("100.00"));
        request.setStartDate(LocalDateTime.now().minusDays(1)); // Past date
        request.setEndDate(LocalDateTime.now().plusDays(7));
        request.setSellerId("seller123");

        // When
        Set<ConstraintViolation<CreateAuctionRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Start date must be in the future")));
    }

    @Test
    void changePasswordRequest_WithValidData_ShouldPassValidation() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPassword123");
        request.setNewPassword("NewPassword456");
        request.setConfirmPassword("NewPassword456");

        // When
        Set<ConstraintViolation<ChangePasswordRequest>> violations = validator.validate(request);

        // Then
        assertTrue(violations.isEmpty());
    }

    @Test
    void changePasswordRequest_WithMismatchedPasswords_ShouldFailValidation() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPassword123");
        request.setNewPassword("NewPassword456");
        request.setConfirmPassword("DifferentPassword789");

        // When
        Set<ConstraintViolation<ChangePasswordRequest>> violations = validator.validate(request);

        // Then
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Passwords do not match")));
    }
}