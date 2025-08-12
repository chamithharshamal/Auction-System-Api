package com.springboot_projects.auction_app_api.exception;

import com.springboot_projects.auction_app_api.dto.ApiResponse;
import com.springboot_projects.auction_app_api.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    // Custom Business Logic Exceptions
    @ExceptionHandler(AuctionNotFoundException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleAuctionNotFoundException(
            AuctionNotFoundException ex, WebRequest request) {
        logger.warn("Auction not found: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "AUCTION_NOT_FOUND",
            ex.getMessage(),
            HttpStatus.NOT_FOUND.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Auction not found", errorResponse));
    }
    
    @ExceptionHandler(AuctionClosedException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleAuctionClosedException(
            AuctionClosedException ex, WebRequest request) {
        logger.warn("Auction closed: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "AUCTION_CLOSED",
            ex.getMessage(),
            HttpStatus.BAD_REQUEST.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Auction is closed", errorResponse));
    }
    
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleUserNotFoundException(
            UserNotFoundException ex, WebRequest request) {
        logger.warn("User not found: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "USER_NOT_FOUND",
            ex.getMessage(),
            HttpStatus.NOT_FOUND.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("User not found", errorResponse));
    }
    
    @ExceptionHandler(BidNotFoundException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleBidNotFoundException(
            BidNotFoundException ex, WebRequest request) {
        logger.warn("Bid not found: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "BID_NOT_FOUND",
            ex.getMessage(),
            HttpStatus.NOT_FOUND.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Bid not found", errorResponse));
    }
    
    @ExceptionHandler(InvalidBidException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleInvalidBidException(
            InvalidBidException ex, WebRequest request) {
        logger.warn("Invalid bid: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "INVALID_BID",
            ex.getMessage(),
            HttpStatus.BAD_REQUEST.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid bid", errorResponse));
    }
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleUnauthorizedException(
            UnauthorizedException ex, WebRequest request) {
        logger.warn("Unauthorized access: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "UNAUTHORIZED",
            ex.getMessage(),
            HttpStatus.UNAUTHORIZED.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Unauthorized", errorResponse));
    }
    
    // Authentication and Authorization Exceptions
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        logger.warn("Authentication failed: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "AUTHENTICATION_FAILED",
            "Authentication failed",
            HttpStatus.UNAUTHORIZED.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Authentication failed", errorResponse));
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleBadCredentialsException(
            BadCredentialsException ex, WebRequest request) {
        logger.warn("Bad credentials: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "BAD_CREDENTIALS",
            "Invalid username or password",
            HttpStatus.UNAUTHORIZED.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid credentials", errorResponse));
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        logger.warn("Access denied: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "ACCESS_DENIED",
            "Access denied",
            HttpStatus.FORBIDDEN.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied", errorResponse));
    }
    
    // Validation Exceptions
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        logger.warn("Validation failed: {}", ex.getMessage());
        
        List<String> details = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "VALIDATION_FAILED",
            "Validation failed",
            HttpStatus.BAD_REQUEST.value(),
            request.getDescription(false).replace("uri=", ""),
            details
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed", errorResponse));
    }
    
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleConstraintViolationException(
            ConstraintViolationException ex, WebRequest request) {
        logger.warn("Constraint violation: {}", ex.getMessage());
        
        List<String> details = ex.getConstraintViolations()
                .stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.toList());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "CONSTRAINT_VIOLATION",
            "Constraint violation",
            HttpStatus.BAD_REQUEST.value(),
            request.getDescription(false).replace("uri=", ""),
            details
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Constraint violation", errorResponse));
    }
    
    // HTTP Method and Parameter Exceptions
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleMethodNotSupportedException(
            HttpRequestMethodNotSupportedException ex, WebRequest request) {
        logger.warn("Method not supported: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "METHOD_NOT_SUPPORTED",
            "HTTP method not supported: " + ex.getMethod(),
            HttpStatus.METHOD_NOT_ALLOWED.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse.error("Method not supported", errorResponse));
    }
    
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleMissingParameterException(
            MissingServletRequestParameterException ex, WebRequest request) {
        logger.warn("Missing parameter: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "MISSING_PARAMETER",
            "Missing required parameter: " + ex.getParameterName(),
            HttpStatus.BAD_REQUEST.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Missing parameter", errorResponse));
    }
    
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleTypeMismatchException(
            MethodArgumentTypeMismatchException ex, WebRequest request) {
        logger.warn("Type mismatch: {}", ex.getMessage());
        
        String message = String.format("Invalid value '%s' for parameter '%s'. Expected type: %s",
                ex.getValue(), ex.getName(), ex.getRequiredType().getSimpleName());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "TYPE_MISMATCH",
            message,
            HttpStatus.BAD_REQUEST.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Type mismatch", errorResponse));
    }
    
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleMessageNotReadableException(
            HttpMessageNotReadableException ex, WebRequest request) {
        logger.warn("Message not readable: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "MALFORMED_JSON",
            "Malformed JSON request",
            HttpStatus.BAD_REQUEST.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Malformed request", errorResponse));
    }
    
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleNoHandlerFoundException(
            NoHandlerFoundException ex, WebRequest request) {
        logger.warn("No handler found: {}", ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            "ENDPOINT_NOT_FOUND",
            "Endpoint not found: " + ex.getRequestURL(),
            HttpStatus.NOT_FOUND.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Endpoint not found", errorResponse));
    }
    
    // Generic Exception Handler
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleGenericException(
            Exception ex, WebRequest request) {
        logger.error("Unexpected error occurred", ex);
        
        ErrorResponse errorResponse = new ErrorResponse(
            "INTERNAL_SERVER_ERROR",
            "An unexpected error occurred",
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            request.getDescription(false).replace("uri=", "")
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error", errorResponse));
    }
}