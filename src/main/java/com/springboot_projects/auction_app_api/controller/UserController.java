package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.dto.*;
import com.springboot_projects.auction_app_api.exception.UserNotFoundException;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // Create new user
    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody CreateUserRequest request) {
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
                .body(ApiResponse.success("User created successfully", userDto));
    }

    // Get user by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.isCurrentUser(authentication.name, #id)")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable String id) {
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            UserDto userDto = new UserDto(user.get());
            return ResponseEntity.ok(ApiResponse.success(userDto));
        } else {
            throw new UserNotFoundException("User not found with ID: " + id);
        }
    }

    // Get user by username
    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UserDto>> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.getUserByUsername(username);
        if (user.isPresent()) {
            UserDto userDto = new UserDto(user.get());
            return ResponseEntity.ok(ApiResponse.success(userDto));
        } else {
            throw new UserNotFoundException("User not found with username: " + username);
        }
    }

    // Update user
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.isCurrentUser(authentication.name, #id)")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(@PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request) {
        User updateData = new User();
        updateData.setFirstName(request.getFirstName());
        updateData.setLastName(request.getLastName());
        updateData.setPhoneNumber(request.getPhoneNumber());
        updateData.setRoles(request.getRoles());

        User updatedUser = userService.updateUser(id, updateData);
        UserDto userDto = new UserDto(updatedUser);

        return ResponseEntity.ok(ApiResponse.success("User updated successfully", userDto));
    }

    // Get all users with pagination
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> users = userService.getAllUsers(pageable);
        Page<UserDto> userDtos = users.map(UserDto::new);

        return ResponseEntity.ok(ApiResponse.success(userDtos));
    }

    // Get active users
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<UserDto>>> getActiveUsers() {
        List<User> users = userService.getActiveUsers();
        List<UserDto> userDtos = users.stream()
                .map(UserDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(userDtos));
    }

    // Get users by role
    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsersByRole(@PathVariable User.Role role) {
        List<User> users = userService.getUsersByRole(role);
        List<UserDto> userDtos = users.stream()
                .map(UserDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(userDtos));
    }

    // Search users by name
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserDto>>> searchUsers(@RequestParam String name) {
        List<User> users = userService.searchUsersByName(name);
        List<UserDto> userDtos = users.stream()
                .map(UserDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(userDtos));
    }

    // Add role to user
    @PostMapping("/{id}/roles/{role}")
    public ResponseEntity<ApiResponse<UserDto>> addRoleToUser(@PathVariable String id,
            @PathVariable User.Role role) {
        User updatedUser = userService.addRoleToUser(id, role);
        UserDto userDto = new UserDto(updatedUser);

        return ResponseEntity.ok(ApiResponse.success("Role added successfully", userDto));
    }

    // Remove role from user
    @DeleteMapping("/{id}/roles/{role}")
    public ResponseEntity<ApiResponse<UserDto>> removeRoleFromUser(@PathVariable String id,
            @PathVariable User.Role role) {
        User updatedUser = userService.removeRoleFromUser(id, role);
        UserDto userDto = new UserDto(updatedUser);

        return ResponseEntity.ok(ApiResponse.success("Role removed successfully", userDto));
    }

    // Toggle user status
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(@PathVariable String id) {
        User updatedUser = userService.toggleUserStatus(id);
        UserDto userDto = new UserDto(updatedUser);

        return ResponseEntity.ok(ApiResponse.success("User status updated", userDto));
    }

    // Check username availability
    @GetMapping("/check-username/{username}")
    public ResponseEntity<ApiResponse<Boolean>> checkUsernameAvailability(@PathVariable String username) {
        boolean exists = userService.isUsernameExists(username);
        return ResponseEntity.ok(ApiResponse.success("Username availability checked", !exists));
    }

    // Check email availability
    @GetMapping("/check-email/{email}")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailAvailability(@PathVariable String email) {
        boolean exists = userService.isEmailExists(email);
        return ResponseEntity.ok(ApiResponse.success("Email availability checked", !exists));
    }

    // Change password
    @PatchMapping("/{id}/change-password")
    @PreAuthorize("hasRole('ADMIN') or @userService.isCurrentUser(authentication.name, #id)")
    public ResponseEntity<ApiResponse<Void>> changePassword(@PathVariable String id,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}