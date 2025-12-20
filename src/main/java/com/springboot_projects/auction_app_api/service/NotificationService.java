package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.model.Notification;
import com.springboot_projects.auction_app_api.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Notification createNotification(String recipientId, String message, Notification.NotificationType type,
            String relatedEntityId) {
        Notification notification = new Notification(recipientId, message, type, relatedEntityId);
        Notification savedNotification = notificationRepository.save(notification);

        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSendToUser(recipientId, "/queue/notifications", savedNotification);

        return savedNotification;
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByRecipientIdAndReadOrderByCreatedAtDesc(userId, false);
    }

    public List<Notification> getAllNotifications(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndReadOrderByCreatedAtDesc(userId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientIdAndRead(userId, false);
    }
}
