package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.dto.PaymentRequest;
import com.springboot_projects.auction_app_api.dto.PaymentResponse;
import com.springboot_projects.auction_app_api.exception.AuctionNotFoundException;
import com.springboot_projects.auction_app_api.exception.UnauthorizedException;
import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.Payment;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.repository.AuctionItemRepository;
import com.springboot_projects.auction_app_api.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AuctionItemRepository auctionItemRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request, String username) {
        // 1. Validate Auction Exists
        AuctionItem auction = auctionItemRepository.findById(request.getAuctionId())
                .orElseThrow(
                        () -> new AuctionNotFoundException("Auction not found with ID: " + request.getAuctionId()));

        User payer = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Validate Payment Eligibility
        // Check if auction has ended
        if (!auction.hasEnded()) {
            throw new RuntimeException("Cannot pay for an active auction");
        }

        // Check if user is the winner
        if (auction.getHighestBidder() == null || !auction.getHighestBidder().getId().equals(payer.getId())) {
            throw new UnauthorizedException("Only the auction winner can pay for this item");
        }

        // Check if already paid
        if (auction.isPaid()) {
            throw new RuntimeException("This auction has already been paid for");
        }

        // 3. Mock Payment Processing (Simulate success)
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 4. Save Payment Record
        Payment payment = new Payment(
                auction.getId(),
                payer.getId(),
                auction.getCurrentPrice(),
                "CARD", // Mock method
                transactionId,
                "SUCCESS");
        paymentRepository.save(payment);

        // 5. Update Auction Status
        auction.setPaid(true);
        auctionItemRepository.save(auction);

        return new PaymentResponse(
                payment.getId(),
                "SUCCESS",
                transactionId,
                "Payment processed successfully");
    }

    public boolean isAuctionPaid(String auctionId) {
        return auctionItemRepository.findById(auctionId)
                .map(AuctionItem::isPaid)
                .orElse(false);
    }
}
