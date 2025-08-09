package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // Create new user
    public User createUser(User user) {
        validateUserForCreation(user);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    // Get user by ID
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
    
    // Get user by username
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    // Get user by email
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    // Get user by username or email
    public Optional<User> getUserByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);
    }
    
    // Update user
    public User updateUser(String id, User updatedUser) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            updateUserFields(user, updatedUser);
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + id);
    }
    
    // Update user password
    public void updatePassword(String userId, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found with id: " + userId);
        }
    }
    
    // Add role to user
    public User addRoleToUser(String userId, User.Role role) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.getRoles().add(role);
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }
    
    // Remove role from user
    public User removeRoleFromUser(String userId, User.Role role) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.getRoles().remove(role);
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }
    
    // Activate/Deactivate user
    public User toggleUserStatus(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setActive(!user.isActive());
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }
    
    // Get all active users
    public List<User> getActiveUsers() {
        return userRepository.findByActiveTrue();
    }
    
    // Get users by role
    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }
    
    // Search users by name
    public List<User> searchUsersByName(String name) {
        return userRepository.findByFirstNameContainingIgnoreCase(name);
    }
    
    // Check if username exists
    public boolean isUsernameExists(String username) {
        return userRepository.existsByUsername(username);
    }
    
    // Check if email exists
    public boolean isEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }
    
    // Validate password
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    
    // Delete user
    public void deleteUser(String userId) {
        if (userRepository.existsById(userId)) {
            userRepository.deleteById(userId);
        } else {
            throw new RuntimeException("User not found with id: " + userId);
        }
    }
    
    // Get all users with pagination
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }
    
    // Private helper methods
    private void validateUserForCreation(User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        if (isUsernameExists(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (isEmailExists(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
    }
    
    private void updateUserFields(User existingUser, User updatedUser) {
        if (updatedUser.getFirstName() != null) {
            existingUser.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            existingUser.setLastName(updatedUser.getLastName());
        }
        if (updatedUser.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
        }
        if (updatedUser.getRoles() != null) {
            existingUser.setRoles(updatedUser.getRoles());
        }
    }
}