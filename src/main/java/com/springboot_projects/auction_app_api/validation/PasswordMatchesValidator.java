package com.springboot_projects.auction_app_api.validation;

import com.springboot_projects.auction_app_api.dto.ChangePasswordRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchesValidator implements ConstraintValidator<PasswordMatches, ChangePasswordRequest> {
    
    @Override
    public void initialize(PasswordMatches constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(ChangePasswordRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return true;
        }
        
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();
        
        if (newPassword == null || confirmPassword == null) {
            return true; // Let @NotBlank handle null validation
        }
        
        return newPassword.equals(confirmPassword);
    }
}