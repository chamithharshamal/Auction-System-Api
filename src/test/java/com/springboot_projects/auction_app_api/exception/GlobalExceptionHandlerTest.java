package com.springboot_projects.auction_app_api.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot_projects.auction_app_api.dto.ApiResponse;
import com.springboot_projects.auction_app_api.dto.ErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    private WebRequest webRequest;
    private MockHttpServletRequest httpServletRequest;

    @BeforeEach
    void setUp() {
        httpServletRequest = new MockHttpServletRequest();
        httpServletRequest.setRequestURI("/api/test");
        webRequest = new ServletWebRequest(httpServletRequest);
    }

    @Test
    void handleAuctionNotFoundException_ShouldReturnNotFound() {
        // Given
        AuctionNotFoundException exception = new AuctionNotFoundException("Auction not found with ID: 123");

        // When
        ResponseEntity<ApiResponse<ErrorResponse>> response = 
            globalExceptionHandler.handleAuctionNotFoundException(exception, webRequest);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Auction not found", response.getBody().getMessage());
        
        ErrorResponse errorResponse = response.getBody().getData();
        assertEquals("AUCTION_NOT_FOUND", errorResponse.getError());
        assertEquals("Auction not found with ID: 123", errorResponse.getMessage());
        assertEquals(404, errorResponse.getStatus());
    }

    @Test
    void handleUserNotFoundException_ShouldReturnNotFound() {
        // Given
        UserNotFoundException exception = new UserNotFoundException("User not found with ID: 456");

        // When
        ResponseEntity<ApiResponse<ErrorResponse>> response = 
            globalExceptionHandler.handleUserNotFoundException(exception, webRequest);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        
        ErrorResponse errorResponse = response.getBody().getData();
        assertEquals("USER_NOT_FOUND", errorResponse.getError());
        assertEquals("User not found with ID: 456", errorResponse.getMessage());
    }

    @Test
    void handleUnauthorizedException_ShouldReturnUnauthorized() {
        // Given
        UnauthorizedException exception = new UnauthorizedException("Invalid credentials");

        // When
        ResponseEntity<ApiResponse<ErrorResponse>> response = 
            globalExceptionHandler.handleUnauthorizedException(exception, webRequest);

        // Then
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        
        ErrorResponse errorResponse = response.getBody().getData();
        assertEquals("UNAUTHORIZED", errorResponse.getError());
        assertEquals("Invalid credentials", errorResponse.getMessage());
        assertEquals(401, errorResponse.getStatus());
    }

    @Test
    void handleBadCredentialsException_ShouldReturnUnauthorized() {
        // Given
        BadCredentialsException exception = new BadCredentialsException("Bad credentials");

        // When
        ResponseEntity<ApiResponse<ErrorResponse>> response = 
            globalExceptionHandler.handleBadCredentialsException(exception, webRequest);

        // Then
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        
        ErrorResponse errorResponse = response.getBody().getData();
        assertEquals("BAD_CREDENTIALS", errorResponse.getError());
        assertEquals("Invalid username or password", errorResponse.getMessage());
    }

    @Test
    void handleAccessDeniedException_ShouldReturnForbidden() {
        // Given
        AccessDeniedException exception = new AccessDeniedException("Access denied");

        // When
        ResponseEntity<ApiResponse<ErrorResponse>> response = 
            globalExceptionHandler.handleAccessDeniedException(exception, webRequest);

        // Then
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        
        ErrorResponse errorResponse = response.getBody().getData();
        assertEquals("ACCESS_DENIED", errorResponse.getError());
        assertEquals("Access denied", errorResponse.getMessage());
        assertEquals(403, errorResponse.getStatus());
    }

    @Test
    void handleValidationException_ShouldReturnBadRequest() {
        // Given
        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        
        FieldError fieldError1 = new FieldError("user", "username", "Username is required");
        FieldError fieldError2 = new FieldError("user", "email", "Email is invalid");
        
        when(exception.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError1, fieldError2));

        // When
        ResponseEntity<ApiResponse<ErrorResponse>> response = 
            globalExceptionHandler.handleValidationException(exception, webRequest);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        ErrorResponse errorResponse = response.getBody().getData();
        assertEquals("VALIDATION_FAILED", errorResponse.getError());
        assertEquals("Validation failed", errorResponse.getMessage());
        assertEquals(400, errorResponse.getStatus());
        
        assertNotNull(errorResponse.getDetails());
        assertEquals(2, errorResponse.getDetails().size());
        assertTrue(errorResponse.getDetails().contains("username: Username is required"));
        assertTrue(errorResponse.getDetails().contains("email: Email is invalid"));
    }

    @Test
    void handleGenericException_ShouldReturnInternalServerError() {
        // Given
        Exception exception = new RuntimeException("Unexpected error");

        // When
        ResponseEntity<ApiResponse<ErrorResponse>> response = 
            globalExceptionHandler.handleGenericException(exception, webRequest);

        // Then
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        
        ErrorResponse errorResponse = response.getBody().getData();
        assertEquals("INTERNAL_SERVER_ERROR", errorResponse.getError());
        assertEquals("An unexpected error occurred", errorResponse.getMessage());
        assertEquals(500, errorResponse.getStatus());
    }

    @Test
    void errorResponse_ShouldHaveTimestamp() {
        // Given
        AuctionNotFoundException exception = new AuctionNotFoundException("Test exception");

        // When
        ResponseEntity<ApiResponse<ErrorResponse>> response = 
            globalExceptionHandler.handleAuctionNotFoundException(exception, webRequest);

        // Then
        ErrorResponse errorResponse = response.getBody().getData();
        assertNotNull(errorResponse.getTimestamp());
    }
}