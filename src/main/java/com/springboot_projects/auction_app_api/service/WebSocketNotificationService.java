package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.dto.BidNotification;
import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.Bid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
public class WebSocketNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketNotificationService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private AuctionItemService auctionItemService;

    // Track auction watchers: auctionId -> Set of session IDs
    private final Map<String, Set<String>> auctionWatchers = new ConcurrentHashMap<>();

    // Track user sessions: sessionId -> username
    private final Map<String, String> sessionUsers = new ConcurrentHashMap<>();

    public void notifyNewBid(String auctionId, Bid bid) {
        try {
            // Get auction details
            AuctionItem auction = auctionItemService.getAuctionItemById(auctionId)
                    .orElseThrow(() -> new RuntimeException("Auction not found"));

            // Create notification
            BidNotification notification = new BidNotification();
            notification.setAuctionId(auctionId);
            notification.setBidId(bid.getId());
            notification.setBidderUsername(bid.getBidder().getUsername());
            notification.setBidAmount(bid.getAmount());
            notification.setPreviousHighestBid(auction.getCurrentPrice());
            notification.setBidTime(bid.getTimestamp());
            notification.setTotalBids(auction.getTotalBids());
            notification.setType(BidNotification.NotificationType.NEW_BID);
            notification.setMessage("New bid placed: $" + bid.getAmount());

            // Send to all auction watchers
            messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/bids", notification);

            // Notify previous highest bidder that they've been outbid
            if (auction.getHighestBidder() != null &&
                    !auction.getHighestBidder().getId().equals(bid.getBidder().getId())) {
                notifyBidOutbid(auction.getHighestBidder().getId(), auctionId, bid.getAmount());
            }

            logger.info("Sent new bid notification for auction {} to {} watchers",
                    auctionId, getWatcherCount(auctionId));

        } catch (Exception e) {
            logger.error("Error sending new bid notification for auction {}: {}", auctionId, e.getMessage());
        }
    }

    public void notifyBidConfirmation(String bidderId, Bid bid) {
        BidNotification notification = new BidNotification();
        notification.setAuctionId(bid.getAuctionItem().getId());
        notification.setBidId(bid.getId());
        notification.setBidAmount(bid.getAmount());
        notification.setType(BidNotification.NotificationType.NEW_BID);
        notification.setMessage("Your bid of $" + bid.getAmount() + " has been placed successfully!");

        messagingTemplate.convertAndSendToUser(bidderId, "/queue/bid-confirmation", notification);
    }

    public void notifyBidOutbid(String bidderId, String auctionId, BigDecimal newBidAmount) {
        BidNotification notification = new BidNotification();
        notification.setAuctionId(auctionId);
        notification.setBidAmount(newBidAmount);
        notification.setType(BidNotification.NotificationType.BID_OUTBID);
        notification.setMessage("You have been outbid! New highest bid: $" + newBidAmount);

        messagingTemplate.convertAndSendToUser(bidderId, "/queue/bid-outbid", notification);
    }

    public void notifyBidError(String bidderId, String auctionId, String errorMessage) {
        BidNotification notification = new BidNotification();
        notification.setAuctionId(auctionId);
        notification.setMessage("Bid failed: " + errorMessage);

        messagingTemplate.convertAndSendToUser(bidderId, "/queue/bid-error", notification);
    }

    public void notifyAuctionEndingSoon(String auctionId, int minutesRemaining) {
        try {
            AuctionItem auction = auctionItemService.getAuctionItemById(auctionId)
                    .orElseThrow(() -> new RuntimeException("Auction not found"));

            BidNotification notification = new BidNotification();
            notification.setAuctionId(auctionId);
            notification.setType(BidNotification.NotificationType.AUCTION_ENDING_SOON);
            notification.setMessage("Auction ending in " + minutesRemaining + " minutes!");

            messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/status", notification);

        } catch (Exception e) {
            logger.error("Error sending auction ending notification for auction {}: {}", auctionId, e.getMessage());
        }
    }

    public void notifyAuctionEnded(String auctionId, String winnerId) {
        try {
            BidNotification notification = new BidNotification();
            notification.setAuctionId(auctionId);
            notification.setType(BidNotification.NotificationType.AUCTION_ENDED);
            notification.setMessage("Auction has ended!");

            // Send to all watchers
            messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/status", notification);

            // Send winner notification
            if (winnerId != null) {
                BidNotification winnerNotification = new BidNotification();
                winnerNotification.setAuctionId(auctionId);
                winnerNotification.setType(BidNotification.NotificationType.BID_WON);
                winnerNotification.setMessage("Congratulations! You won the auction!");

                messagingTemplate.convertAndSendToUser(winnerId, "/queue/auction-won", winnerNotification);
            }

        } catch (Exception e) {
            logger.error("Error sending auction ended notification for auction {}: {}", auctionId, e.getMessage());
        }
    }

    public void addAuctionWatcher(String auctionId, String sessionId, String username) {
        auctionWatchers.computeIfAbsent(auctionId, k -> new CopyOnWriteArraySet<>()).add(sessionId);
        sessionUsers.put(sessionId, username);

        logger.info("Added watcher {} (session: {}) to auction {}", username, sessionId, auctionId);
    }

    public void removeAuctionWatcher(String auctionId, String sessionId) {
        Set<String> watchers = auctionWatchers.get(auctionId);
        if (watchers != null) {
            watchers.remove(sessionId);
            if (watchers.isEmpty()) {
                auctionWatchers.remove(auctionId);
            }
        }

        String username = sessionUsers.remove(sessionId);
        logger.info("Removed watcher {} (session: {}) from auction {}", username, sessionId, auctionId);
    }

    public void sendAuctionStatus(String auctionId, String sessionId) {
        try {
            AuctionItem auction = auctionItemService.getAuctionItemById(auctionId)
                    .orElseThrow(() -> new RuntimeException("Auction not found"));

            BidNotification status = new BidNotification();
            status.setAuctionId(auctionId);
            status.setBidAmount(auction.getCurrentPrice());
            status.setTotalBids(auction.getTotalBids());
            status.setMessage("Current auction status");

            messagingTemplate.convertAndSendToUser(sessionId, "/queue/auction-status", status);

        } catch (Exception e) {
            logger.error("Error sending auction status for auction {}: {}", auctionId, e.getMessage());
        }
    }

    public int getWatcherCount(String auctionId) {
        Set<String> watchers = auctionWatchers.get(auctionId);
        return watchers != null ? watchers.size() : 0;
    }

    public void removeSessionFromAllAuctions(String sessionId) {
        auctionWatchers.values().forEach(watchers -> watchers.remove(sessionId));
        sessionUsers.remove(sessionId);
    }
}