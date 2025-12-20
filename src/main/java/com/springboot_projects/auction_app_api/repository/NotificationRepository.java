package com.springboot_projects.auction_app_api.repository;

import com.springboot_projects.auction_app_api.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);

    List<Notification> findByRecipientIdAndReadOrderByCreatedAtDesc(String recipientId, boolean read);

    long countByRecipientIdAndRead(String recipientId, boolean read);
}
