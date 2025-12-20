package com.springboot_projects.auction_app_api.repository;

import com.springboot_projects.auction_app_api.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByPayerId(String payerId);

    Optional<Payment> findByAuctionId(String auctionId);

    List<Payment> findByAuctionIdIn(List<String> auctionIds);
}
