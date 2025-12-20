package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.model.Notification;
import com.springboot_projects.auction_app_api.service.NotificationService;
import com.springboot_projects.auction_app_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(notificationService.getAllNotifications(userId));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        String userId = getUserId(authentication);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    private String getUserId(Authentication authentication) {
        // Assuming the name is the username, we need the user ID
        return userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
