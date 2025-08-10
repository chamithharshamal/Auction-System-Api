package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.dto.*;
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
    public ResponseEntity<ApiResponse<UserDto>> createUser(@RequestBody CreateUserRequest request) {
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
                    .body(ApiResponse.success("User created successfully", userDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable String id) {
        try {
            Optional<User> user = userService.getUserById(id);
            if (user.isPresent()) {
                UserDto userDto = new UserDto(user.get());
                return ResponseEntity.ok(ApiResponse.success(userDto));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get user by username
    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UserDto>> getUserByUsername(@PathVariable String username) {
        try {
            Optional<User> user = userService.getUserByUsername(username);
            if (user.isPresent()) {
                UserDto userDto = new UserDto(user.get());
                return ResponseEntity.ok(ApiResponse.success(userDto));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(@PathVariable String id, 
                                                          @RequestBody UpdateUserRequest request) {
        try {
            User updateData = new User();
            updateData.setFirstName(request.getFirstName());
            updateData.setLastName(request.getLastName());
            updateData.setPhoneNumber(request.getPhoneNumber());
            updateData.setRoles(request.getRoles());
            
            User updatedUser = userService.updateUser(id, updateData);
            UserDto userDto = new UserDto(updatedUser);
            
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", userDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get all users with pagination
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                    Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<User> users = userService.getAllUsers(pageable);
            Page<UserDto> userDtos = users.map(UserDto::new);
            
            return ResponseEntity.ok(ApiResponse.success(userDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get active users
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<UserDto>>> getActiveUsers() {
        try {
            List<User> users = userService.getActiveUsers();
            List<UserDto> userDtos = users.stream()
                    .map(UserDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(userDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get users by role
    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsersByRole(@PathVariable User.Role role) {
        try {
            List<User> users = userService.getUsersByRole(role);
            List<UserDto> userDtos = users.stream()
                    .map(UserDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(userDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Search users by name
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserDto>>> searchUsers(@RequestParam String name) {
        try {
            List<User> users = userService.searchUsersByName(name);
            List<UserDto> userDtos = users.stream()
                    .map(UserDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(userDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Add role to user
    @PostMapping("/{id}/roles/{role}")
    public ResponseEntity<ApiResponse<UserDto>> addRoleToUser(@PathVariable String id, 
                                                             @PathVariable User.Role role) {
        try {
            User updatedUser = userService.addRoleToUser(id, role);
            UserDto userDto = new UserDto(updatedUser);
            
            return ResponseEntity.ok(ApiResponse.success("Role added successfully", userDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Remove role from user
    @DeleteMapping("/{id}/roles/{role}")
    public ResponseEntity<ApiResponse<UserDto>> removeRoleFromUser(@PathVariable String id, 
                                                                  @PathVariable User.Role role) {
        try {
            User updatedUser = userService.removeRoleFromUser(id, role);
            UserDto userDto = new UserDto(updatedUser);
            
            return ResponseEntity.ok(ApiResponse.success("Role removed successfully", userDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Toggle user status
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(@PathVariable String id) {
        try {
            User updatedUser = userService.toggleUserStatus(id);
            UserDto userDto = new UserDto(updatedUser);
            
            return ResponseEntity.ok(ApiResponse.success("User status updated", userDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Check username availability
    @GetMapping("/check-username/{username}")
    public ResponseEntity<ApiResponse<Boolean>> checkUsernameAvailability(@PathVariable String username) {
        try {
            boolean exists = userService.isUsernameExists(username);
            return ResponseEntity.ok(ApiResponse.success("Username availability checked", !exists));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Check email availability
    @GetMapping("/check-email/{email}")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailAvailability(@PathVariable String email) {
        try {
            boolean exists = userService.isEmailExists(email);
            return ResponseEntity.ok(ApiResponse.success("Email availability checked", !exists));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}