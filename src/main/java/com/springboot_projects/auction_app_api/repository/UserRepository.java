package com.springboot_projects.auction_app_api.repository;

import com.springboot_projects.auction_app_api.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    // Find by username
    Optional<User> findByUsername(String username);
    
    // Find by email
    Optional<User> findByEmail(String email);
    
    // Find by username or email
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    // Check if username exists
    boolean existsByUsername(String username);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Find active users
    List<User> findByActiveTrue();
    
    // Find users by role
    @Query("{'roles': ?0}")
    List<User> findByRole(User.Role role);
    
    // Find users by roles containing
    @Query("{'roles': {'$in': ?0}}")
    List<User> findByRolesIn(List<User.Role> roles);
    
    // Find users by first name and last name
    List<User> findByFirstNameAndLastName(String firstName, String lastName);
    
    // Find users by first name containing (case insensitive)
    @Query("{'firstName': {'$regex': ?0, '$options': 'i'}}")
    List<User> findByFirstNameContainingIgnoreCase(String firstName);
    
    // Find users by email domain
    @Query("{'email': {'$regex': ?0}}")
    List<User> findByEmailDomain(String domain);
}