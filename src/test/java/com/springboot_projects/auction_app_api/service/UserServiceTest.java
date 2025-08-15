package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.exception.UnauthorizedException;
import com.springboot_projects.auction_app_api.exception.UserNotFoundException;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private User newUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("user123");
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encoded-password");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRoles(Set.of(User.Role.BIDDER));
        testUser.setActive(true);
        testUser.setCreatedAt(LocalDateTime.now());

        newUser = new User();
        newUser.setUsername("newuser");
        newUser.setEmail("new@example.com");
        newUser.setPassword("raw-password");
        newUser.setFirstName("New");
        newUser.setLastName("User");
        newUser.setRoles(Set.of(User.Role.BIDDER));
    }

    @Test
    void createUser_WithValidData_ShouldReturnCreatedUser() {
        // Given
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.createUser(newUser);

        // Then
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(passwordEncoder).encode("raw-password");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_WithExistingUsername_ShouldThrowException() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(true);

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.createUser(newUser)
        );
        assertEquals("Username already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void createUser_WithExistingEmail_ShouldThrowException() {
        // Given
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(true);

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.createUser(newUser)
        );
        assertEquals("Email already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void getUserById_WithExistingId_ShouldReturnUser() {
        // Given
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        // When
        Optional<User> result = userService.getUserById("user123");

        // Then
        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getUsername());
    }

    @Test
    void getUserById_WithNonExistingId_ShouldReturnEmpty() {
        // Given
        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When
        Optional<User> result = userService.getUserById("nonexistent");

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void updateUser_WithExistingUser_ShouldReturnUpdatedUser() {
        // Given
        User updateData = new User();
        updateData.setFirstName("Updated");
        updateData.setLastName("Name");

        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.updateUser("user123", updateData);

        // Then
        assertNotNull(result);
        verify(userRepository).save(testUser);
    }

    @Test
    void updateUser_WithNonExistingUser_ShouldThrowException() {
        // Given
        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        UserNotFoundException exception = assertThrows(
            UserNotFoundException.class,
            () -> userService.updateUser("nonexistent", new User())
        );
        assertEquals("User not found with id: nonexistent", exception.getMessage());
    }

    @Test
    void changePassword_WithCorrectCurrentPassword_ShouldUpdatePassword() {
        // Given
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("current-password", "encoded-password")).thenReturn(true);
        when(passwordEncoder.encode("new-password")).thenReturn("new-encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        userService.changePassword("user123", "current-password", "new-password");

        // Then
        verify(passwordEncoder).matches("current-password", "encoded-password");
        verify(passwordEncoder).encode("new-password");
        verify(userRepository).save(testUser);
    }

    @Test
    void changePassword_WithIncorrectCurrentPassword_ShouldThrowException() {
        // Given
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        // When & Then
        UnauthorizedException exception = assertThrows(
            UnauthorizedException.class,
            () -> userService.changePassword("user123", "wrong-password", "new-password")
        );
        assertEquals("Current password is incorrect", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_WithNonExistingUser_ShouldThrowException() {
        // Given
        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        UserNotFoundException exception = assertThrows(
            UserNotFoundException.class,
            () -> userService.changePassword("nonexistent", "current", "new")
        );
        assertEquals("User not found with id: nonexistent", exception.getMessage());
    }

    @Test
    void addRoleToUser_WithExistingUser_ShouldAddRole() {
        // Given
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.addRoleToUser("user123", User.Role.SELLER);

        // Then
        assertNotNull(result);
        verify(userRepository).save(testUser);
        assertTrue(testUser.getRoles().contains(User.Role.SELLER));
    }

    @Test
    void removeRoleFromUser_WithExistingUser_ShouldRemoveRole() {
        // Given
        testUser.getRoles().add(User.Role.SELLER);
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.removeRoleFromUser("user123", User.Role.SELLER);

        // Then
        assertNotNull(result);
        verify(userRepository).save(testUser);
        assertFalse(testUser.getRoles().contains(User.Role.SELLER));
    }

    @Test
    void toggleUserStatus_WithActiveUser_ShouldDeactivate() {
        // Given
        testUser.setActive(true);
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.toggleUserStatus("user123");

        // Then
        assertNotNull(result);
        assertFalse(testUser.isActive());
        verify(userRepository).save(testUser);
    }

    @Test
    void getAllUsers_ShouldReturnPagedUsers() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> userPage = new PageImpl<>(List.of(testUser));
        when(userRepository.findAll(pageable)).thenReturn(userPage);

        // When
        Page<User> result = userService.getAllUsers(pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("testuser", result.getContent().get(0).getUsername());
    }

    @Test
    void isUsernameExists_WithExistingUsername_ShouldReturnTrue() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // When
        boolean result = userService.isUsernameExists("testuser");

        // Then
        assertTrue(result);
    }

    @Test
    void isEmailExists_WithExistingEmail_ShouldReturnTrue() {
        // Given
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // When
        boolean result = userService.isEmailExists("test@example.com");

        // Then
        assertTrue(result);
    }

    @Test
    void validatePassword_WithCorrectPassword_ShouldReturnTrue() {
        // Given
        when(passwordEncoder.matches("raw-password", "encoded-password")).thenReturn(true);

        // When
        boolean result = userService.validatePassword("raw-password", "encoded-password");

        // Then
        assertTrue(result);
    }

    @Test
    void deleteUser_WithExistingUser_ShouldDeleteUser() {
        // Given
        when(userRepository.existsById("user123")).thenReturn(true);

        // When
        userService.deleteUser("user123");

        // Then
        verify(userRepository).deleteById("user123");
    }

    @Test
    void deleteUser_WithNonExistingUser_ShouldThrowException() {
        // Given
        when(userRepository.existsById("nonexistent")).thenReturn(false);

        // When & Then
        UserNotFoundException exception = assertThrows(
            UserNotFoundException.class,
            () -> userService.deleteUser("nonexistent")
        );
        assertEquals("User not found with id: nonexistent", exception.getMessage());
        verify(userRepository, never()).deleteById(anyString());
    }
}