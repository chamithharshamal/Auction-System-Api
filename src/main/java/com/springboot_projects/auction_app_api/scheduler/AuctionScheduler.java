package com.springboot_projects.auction_app_api.scheduler;

import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.Bid;
import com.springboot_projects.auction_app_api.repository.AuctionItemRepository;
import com.springboot_projects.auction_app_api.service.AuctionItemService;
import com.springboot_projects.auction_app_api.service.BidService;
import com.springboot_projects.auction_app_api.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuctionScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AuctionScheduler.class);

    @Autowired
    private AuctionItemRepository auctionItemRepository;

    @Autowired
    private AuctionItemService auctionItemService;

    @Autowired
    private BidService bidService;

    @Autowired
    private EmailService emailService;

    @Scheduled(fixedRate = 60000) // Run every minute
    public void startScheduledAuctions() {
        logger.info("Checking for pending auctions to start...");

        List<AuctionItem> pendingAuctions = auctionItemRepository.findByStartDateBeforeAndStatus(
                LocalDateTime.now(),
                AuctionItem.AuctionStatus.DRAFT);

        if (!pendingAuctions.isEmpty()) {
            logger.info("Found {} pending auctions. Starting them now.", pendingAuctions.size());

            for (AuctionItem auction : pendingAuctions) {
                try {
                    auctionItemService.startAuction(auction.getId());
                    logger.info("Started auction: {}", auction.getId());
                } catch (Exception e) {
                    logger.error("Failed to auto-start auction: {}", auction.getId(), e);
                }
            }
        }
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    public void closeExpiredAuctions() {
        logger.info("Checking for expired auctions...");

        List<AuctionItem> expiredAuctions = auctionItemRepository.findByEndDateBeforeAndStatus(
                LocalDateTime.now(),
                AuctionItem.AuctionStatus.ACTIVE);

        if (expiredAuctions.isEmpty()) {
            return;
        }

        logger.info("Found {} expired auctions. Closing them now.", expiredAuctions.size());

        for (AuctionItem auction : expiredAuctions) {
            try {
                // Determine if sold or ended without winner
                if (auction.getTotalBids() > 0) {
                    // Logic handled in endAuction or similar method
                    logger.info("Closing auction with bids: {}", auction.getId());
                } else {
                    logger.info("Closing auction with no bids: {}", auction.getId());
                }

                // We use the service method to ensure all business logic (notifications, status
                // update) is executed
                AuctionItem endedAuction = auctionItemService.endAuction(auction.getId());

                // Send email to seller
                emailService.sendAuctionEndedEmail(endedAuction.getSeller(), endedAuction);

                // If there is a winner, send email to winner
                if (endedAuction.getHighestBidder() != null) {
                    Optional<Bid> winningBid = bidService.getHighestBidForAuction(endedAuction);
                    if (winningBid.isPresent()) {
                        emailService.sendAuctionWonEmail(endedAuction.getHighestBidder(), endedAuction,
                                winningBid.get());
                    }
                }

            } catch (Exception e) {
                logger.error("Failed to auto-close auction: {}", auction.getId(), e);
            }
        }
    }
}
