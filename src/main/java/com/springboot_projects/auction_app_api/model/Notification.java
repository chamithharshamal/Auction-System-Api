package com.springboot_projects.auction_app_api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    private String recipientId;
    private String message;
    private NotificationType type;
    private boolean read;
    private LocalDateTime createdAt;
    private String relatedEntityId;

    public enum NotificationType {
        AUCTION_WON,
        PAYMENT_RECEIVED,
        OUTBID,
        AUCTION_ENDED
    }

    public Notification() {
        this.createdAt = LocalDateTime.now();
        this.read = false;
    }

    public Notification(String recipientId, String message, NotificationType type, String relatedEntityId) {
        this();
        this.recipientId = recipientId;
        this.message = message;
        this.type = type;
        this.relatedEntityId = relatedEntityId;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getRelatedEntityId() {
        return relatedEntityId;
    }

    public void setRelatedEntityId(String relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
    }
}
