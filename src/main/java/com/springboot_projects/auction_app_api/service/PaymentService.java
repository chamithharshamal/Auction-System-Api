package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.dto.PaymentRequest;
import com.springboot_projects.auction_app_api.dto.PaymentResponse;
import com.springboot_projects.auction_app_api.exception.AuctionNotFoundException;
import com.springboot_projects.auction_app_api.exception.UnauthorizedException;
import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.Notification;
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

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

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

        // 3. Determine Payment Method and Transaction ID
        String transactionId;
        String method = "CARD";

        if ("PAYPAL".equalsIgnoreCase(request.getPaymentMethod())) {
            method = "PAYPAL";
            transactionId = request.getPaypalOrderId();
            if (transactionId == null || transactionId.isEmpty()) {
                throw new RuntimeException("PayPal Order ID is required for PayPal payments");
            }
            // In a real app, verify order details with PayPal API here
        } else {
            // Mock Card processing
            transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        // 4. Save Payment Record
        Payment payment = new Payment(
                auction.getId(),
                payer.getId(),
                auction.getCurrentPrice(),
                method,
                transactionId,
                "SUCCESS");
        payment.setShippingName(request.getShippingName());
        payment.setShippingAddress(request.getShippingAddress());
        payment.setShippingPhoneNumber(request.getShippingPhoneNumber());
        payment.setCity(request.getCity());
        payment.setZipCode(request.getZipCode());
        payment.setCountry(request.getCountry());
        payment.setDeliveryCharge(request.getDeliveryCharge());
        payment.setTotalAmount(request.getTotalAmount());
        paymentRepository.save(payment);

        // 5. Notify Seller
        notificationService.createNotification(
                auction.getSeller().getId(),
                "Payment received for auction: " + auction.getTitle() + ". Please ship to "
                        + request.getShippingAddress(),
                Notification.NotificationType.PAYMENT_RECEIVED,
                auction.getId());

        // 6. Send Email Notifications
        emailService.sendPaymentConfirmationEmail(
                payer,
                auction,
                auction.getCurrentPrice(),
                transactionId,
                request.getShippingName(),
                request.getShippingAddress());

        emailService.sendPaymentReceivedEmail(
                auction.getSeller(),
                auction,
                auction.getCurrentPrice(),
                payer,
                request.getShippingName(),
                request.getShippingAddress(),
                request.getShippingPhoneNumber());

        // 7. Update Auction Status
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
