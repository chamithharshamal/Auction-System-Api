package com.springboot_projects.auction_app_api.validation;

import com.springboot_projects.auction_app_api.dto.ChangePasswordRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.validation.ConstraintValidatorContext;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class PasswordMatchesValidatorTest {

    private PasswordMatchesValidator validator;

    @Mock
    private ConstraintValidatorContext context;

    @BeforeEach
    void setUp() {
        validator = new PasswordMatchesValidator();
    }

    @Test
    void isValid_WithMatchingPasswords_ShouldReturnTrue() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("current123");
        request.setNewPassword("newPassword123");
        request.setConfirmPassword("newPassword123");

        // When
        boolean result = validator.isValid(request, context);

        // Then
        assertTrue(result);
    }

    @Test
    void isValid_WithNonMatchingPasswords_ShouldReturnFalse() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("current123");
        request.setNewPassword("newPassword123");
        request.setConfirmPassword("differentPassword456");

        // When
        boolean result = validator.isValid(request, context);

        // Then
        assertFalse(result);
    }

    @Test
    void isValid_WithNullRequest_ShouldReturnTrue() {
        // When
        boolean result = validator.isValid(null, context);

        // Then
        assertTrue(result);
    }

    @Test
    void isValid_WithNullPasswords_ShouldReturnTrue() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("current123");
        request.setNewPassword(null);
        request.setConfirmPassword(null);

        // When
        boolean result = validator.isValid(request, context);

        // Then
        assertTrue(result); // Let @NotBlank handle null validation
    }

    @Test
    void isValid_WithOneNullPassword_ShouldReturnTrue() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("current123");
        request.setNewPassword("newPassword123");
        request.setConfirmPassword(null);

        // When
        boolean result = validator.isValid(request, context);

        // Then
        assertTrue(result); // Let @NotBlank handle null validation
    }
}