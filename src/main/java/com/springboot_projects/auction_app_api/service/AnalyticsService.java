package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.dto.SellerAnalyticsResponse;
import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.Payment;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.repository.AuctionItemRepository;
import com.springboot_projects.auction_app_api.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);

    @Autowired
    private AuctionItemRepository auctionItemRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public SellerAnalyticsResponse getSellerAnalytics(User seller) {
        try {
            SellerAnalyticsResponse response = new SellerAnalyticsResponse();

            // 1. Fetch all auctions by seller
            List<AuctionItem> allAuctions = auctionItemRepository.findBySeller(seller);
            if (allAuctions == null)
                allAuctions = new ArrayList<>();

            // 2. Fundamental Counts
            long totalAuctions = allAuctions.size();
            long activeListings = allAuctions.stream()
                    .filter(a -> a != null && a.getStatus() == AuctionItem.AuctionStatus.ACTIVE)
                    .count();
            long endedAuctions = allAuctions.stream()
                    .filter(a -> a != null && a.getStatus() == AuctionItem.AuctionStatus.ENDED)
                    .count();

            // 3. Payments and Earnings
            List<String> auctionIds = allAuctions.stream()
                    .filter(a -> a != null && a.getId() != null)
                    .map(AuctionItem::getId)
                    .collect(Collectors.toList());

            List<Payment> payments = auctionIds.isEmpty() ? new ArrayList<>()
                    : paymentRepository.findByAuctionIdIn(auctionIds);
            if (payments == null)
                payments = new ArrayList<>();

            BigDecimal totalEarnings = payments.stream()
                    .filter(Objects::nonNull)
                    .map(Payment::getAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long soldItems = payments.size(); // We consider sold if a payment exists
            double successRate = endedAuctions > 0 ? (double) soldItems / endedAuctions * 100 : 0;

            // 4. Bids received
            long totalBidsReceived = allAuctions.stream()
                    .filter(Objects::nonNull)
                    .mapToLong(AuctionItem::getTotalBids)
                    .sum();

            // 5. Category Distribution
            Map<String, Long> categoryDistribution = allAuctions.stream()
                    .filter(a -> a != null && a.getCategory() != null)
                    .collect(Collectors.groupingBy(AuctionItem::getCategory, Collectors.counting()));

            // 6. Daily Sales History (Last 30 days)
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            Map<String, SellerAnalyticsResponse.DailySales> salesMap = new TreeMap<>();

            payments.forEach(p -> {
                if (p != null && p.getTimestamp() != null && p.getAmount() != null) {
                    String dateLabel = p.getTimestamp().format(formatter);
                    salesMap.compute(dateLabel, (k, v) -> {
                        if (v == null) {
                            return new SellerAnalyticsResponse.DailySales(dateLabel, p.getAmount(), 1);
                        }
                        v.setAmount(v.getAmount() != null ? v.getAmount().add(p.getAmount()) : p.getAmount());
                        v.setCount(v.getCount() + 1);
                        return v;
                    });
                }
            });

            List<SellerAnalyticsResponse.DailySales> salesHistory = new ArrayList<>(salesMap.values());

            // Set response fields
            response.setTotalEarnings(totalEarnings);
            response.setTotalAuctions(totalAuctions);
            response.setActiveListings(activeListings);
            response.setSoldItems(soldItems);
            response.setSuccessRate(successRate);
            response.setTotalBidsReceived(totalBidsReceived);
            response.setCategoryDistribution(categoryDistribution);
            response.setSalesHistory(salesHistory);

            return response;
        } catch (Exception e) {
            logger.error("Error generating seller analytics for user {}: ",
                    seller != null ? seller.getUsername() : "unknown", e);
            throw e;
        }
    }
}
