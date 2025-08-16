package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.dto.BidNotification;
import com.springboot_projects.auction_app_api.dto.PlaceBidRequest;
import com.springboot_projects.auction_app_api.model.Bid;
import com.springboot_projects.auction_app_api.service.BidService;
import com.springboot_projects.auction_app_api.service.WebSocketNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class BidWebSocketController {
    
    private static final Logger logger = LoggerFactory.getLogger(BidWebSocketController.class);
    
    @Autowired
    private BidService bidService;
    
    @Autowired
    private WebSocketNotificationService notificationService;
    
    // Handle real-time bid placement
    @MessageMapping("/auction/{auctionId}/bid")
    public void placeBid(@DestinationVariable String auctionId, 
                        @Payload PlaceBidRequest bidRequest,
                        SimpMessageHeaderAccessor headerAccessor,
                        Principal principal) {
        try {
            logger.info("Received real-time bid for auction {} from user {}", 
                       auctionId, principal.getName());
            
            // Place the bid
            Bid bid = bidService.placeBid(auctionId, bidRequest.getBidderId(), bidRequest.getAmount());
            
            // Send real-time notification to all auction watchers
            notificationService.notifyNewBid(auctionId, bid);
            
            // Send confirmation to the bidder
            notificationService.notifyBidConfirmation(bidRequest.getBidderId(), bid);
            
        } catch (Exception e) {
            logger.error("Error placing real-time bid for auction {}: {}", auctionId, e.getMessage());
            
            // Send error notification to the bidder
            notificationService.notifyBidError(bidRequest.getBidderId(), auctionId, e.getMessage());
        }
    }
    
    // Handle auction watching (subscribe to auction updates)
    @MessageMapping("/auction/{auctionId}/watch")
    public void watchAuction(@DestinationVariable String auctionId,
                           SimpMessageHeaderAccessor headerAccessor,
                           Principal principal) {
        logger.info("User {} started watching auction {}", principal.getName(), auctionId);
        
        // Add user to auction watchers
        String sessionId = headerAccessor.getSessionId();
        notificationService.addAuctionWatcher(auctionId, sessionId, principal.getName());
        
        // Send current auction status
        notificationService.sendAuctionStatus(auctionId, sessionId);
    }
    
    // Handle auction unwatching (unsubscribe from auction updates)
    @MessageMapping("/auction/{auctionId}/unwatch")
    public void unwatchAuction(@DestinationVariable String auctionId,
                             SimpMessageHeaderAccessor headerAccessor,
                             Principal principal) {
        logger.info("User {} stopped watching auction {}", principal.getName(), auctionId);
        
        // Remove user from auction watchers
        String sessionId = headerAccessor.getSessionId();
        notificationService.removeAuctionWatcher(auctionId, sessionId);
    }
}