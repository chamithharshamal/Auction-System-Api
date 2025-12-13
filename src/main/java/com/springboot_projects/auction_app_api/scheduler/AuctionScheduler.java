package com.springboot_projects.auction_app_api.scheduler;

import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.repository.AuctionItemRepository;
import com.springboot_projects.auction_app_api.service.AuctionItemService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuctionScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AuctionScheduler.class);

    @Autowired
    private AuctionItemRepository auctionItemRepository;

    @Autowired
    private AuctionItemService auctionItemService;

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
                auctionItemService.endAuction(auction.getId());

            } catch (Exception e) {
                logger.error("Failed to auto-close auction: {}", auction.getId(), e);
            }
        }
    }
}
