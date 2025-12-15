package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.Bid;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.repository.BidRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BidService {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private AuctionItemService auctionItemService;

    @Autowired
    private WebSocketNotificationService webSocketNotificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    // Place a new bid
    // Place a new bid
    @Transactional
    public Bid placeBid(String auctionId, String bidderId, BigDecimal bidAmount) {
        // Get auction item
        Optional<AuctionItem> auctionOpt = auctionItemService.getAuctionItemById(auctionId);
        if (!auctionOpt.isPresent()) {
            throw new RuntimeException("Auction not found with id: " + auctionId);
        }

        AuctionItem auction = auctionOpt.get();

        // Validate bid
        validateBid(auction, bidderId, bidAmount);

        // Get bidder
        Optional<User> bidderOpt = userService.getUserById(bidderId);
        if (!bidderOpt.isPresent()) {
            throw new RuntimeException("User not found with id: " + bidderId);
        }
        User bidder = bidderOpt.get();

        // Create new bid
        Bid newBid = new Bid(bidAmount, bidder, auction);
        newBid.setStatus(Bid.BidStatus.WINNING);

        // Save the bid
        Bid savedBid = bidRepository.save(newBid);

        // Update auction item with new highest bid
        auctionItemService.updateCurrentPrice(auctionId, bidAmount, bidder);

        // Update status of previous bids
        updatePreviousBidsStatus(auction, bidAmount);

        // Notify subscribers about the new bid
        webSocketNotificationService.notifyNewBid(auctionId, savedBid);

        // Send confirmation email
        emailService.sendBidConfirmationEmail(bidder, savedBid, auction);

        return savedBid;
    }

    // Get bid by ID
    public Optional<Bid> getBidById(String id) {
        return bidRepository.findById(id);
    }

    // Get bids for auction item
    public List<Bid> getBidsForAuction(AuctionItem auctionItem) {
        return bidRepository.findByAuctionItemOrderByAmountDesc(auctionItem);
    }

    // Get bids for auction item with pagination
    public Page<Bid> getBidsForAuction(AuctionItem auctionItem, Pageable pageable) {
        return bidRepository.findByAuctionItem(auctionItem, pageable);
    }

    // Get recent bids for auction item
    public List<Bid> getRecentBidsForAuction(String auctionId, int limit) {
        Optional<AuctionItem> auctionOpt = auctionItemService.getAuctionItemById(auctionId);
        if (auctionOpt.isPresent()) {
            Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "timestamp"));
            return bidRepository.findByAuctionItem(auctionOpt.get(), pageable).getContent();
        }
        throw new RuntimeException("Auction not found with id: " + auctionId);
    }

    // Get highest bid for auction
    public Optional<Bid> getHighestBidForAuction(AuctionItem auctionItem) {
        return bidRepository.findTopByAuctionItemOrderByAmountDesc(auctionItem);
    }

    // Get latest bid for auction
    public Optional<Bid> getLatestBidForAuction(AuctionItem auctionItem) {
        return bidRepository.findTopByAuctionItemOrderByTimestampDesc(auctionItem);
    }

    // Get bids by bidder
    public List<Bid> getBidsByBidder(User bidder) {
        return bidRepository.findByBidderOrderByTimestampDesc(bidder);
    }

    // Get bids by bidder with pagination
    public Page<Bid> getBidsByBidder(User bidder, Pageable pageable) {
        return bidRepository.findByBidder(bidder, pageable);
    }

    // Get user's recent bids
    public List<Bid> getRecentBidsByBidder(String bidderId, int limit) {
        User bidder = new User();
        bidder.setId(bidderId);
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "timestamp"));
        return bidRepository.findRecentBidsByBidder(bidder, pageable);
    }

    // Get bids by bidder for specific auction
    public List<Bid> getBidsByBidderForAuction(User bidder, AuctionItem auctionItem) {
        return bidRepository.findByBidderAndAuctionItemOrderByTimestampDesc(bidder, auctionItem);
    }

    // Check if user has bid on auction
    public boolean hasUserBidOnAuction(String bidderId, String auctionId) {
        User bidder = new User();
        bidder.setId(bidderId);

        Optional<AuctionItem> auctionOpt = auctionItemService.getAuctionItemById(auctionId);
        if (auctionOpt.isPresent()) {
            return bidRepository.existsByBidderAndAuctionItem(bidder, auctionOpt.get());
        }
        return false;
    }

    // Get winning bids for user
    public List<Bid> getWinningBidsForUser(String bidderId) {
        User bidder = new User();
        bidder.setId(bidderId);
        return bidRepository.findByBidder(bidder).stream()
                .filter(bid -> bid.getStatus() == Bid.BidStatus.WINNING)
                .toList();
    }

    // Cancel bid (only if not winning)
    public Bid cancelBid(String bidId) {
        Optional<Bid> bidOpt = bidRepository.findById(bidId);
        if (bidOpt.isPresent()) {
            Bid bid = bidOpt.get();
            if (bid.getStatus() == Bid.BidStatus.WINNING) {
                throw new IllegalStateException("Cannot cancel winning bid");
            }
            if (bid.getStatus() == Bid.BidStatus.CANCELLED) {
                throw new IllegalStateException("Bid is already cancelled");
            }

            bid.setStatus(Bid.BidStatus.CANCELLED);
            return bidRepository.save(bid);
        }
        throw new RuntimeException("Bid not found with id: " + bidId);
    }

    // Get bid count for auction
    public long getBidCountForAuction(AuctionItem auctionItem) {
        return bidRepository.countByAuctionItem(auctionItem);
    }

    // Get bid count for user
    public long getBidCountForUser(User bidder) {
        return bidRepository.countByBidder(bidder);
    }

    // Get bids by status
    public List<Bid> getBidsByStatus(Bid.BidStatus status) {
        return bidRepository.findByStatus(status);
    }

    // Get bids in date range
    public List<Bid> getBidsInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return bidRepository.findByTimestampBetween(startDate, endDate);
    }

    // Get bids in amount range
    public List<Bid> getBidsInAmountRange(BigDecimal minAmount, BigDecimal maxAmount) {
        return bidRepository.findByAmountBetween(minAmount, maxAmount);
    }

    // Get all active bids
    public List<Bid> getActiveBids() {
        return bidRepository.findActiveBids();
    }

    // Update bid status when auction ends
    @Transactional
    public void updateBidsStatusOnAuctionEnd(String auctionId) {
        Optional<AuctionItem> auctionOpt = auctionItemService.getAuctionItemById(auctionId);
        if (auctionOpt.isPresent()) {
            AuctionItem auction = auctionOpt.get();
            List<Bid> auctionBids = bidRepository.findByAuctionItem(auction);

            Optional<Bid> highestBid = getHighestBidForAuction(auction);

            for (Bid bid : auctionBids) {
                if (highestBid.isPresent() && bid.getId().equals(highestBid.get().getId())) {
                    bid.setStatus(Bid.BidStatus.WINNING);
                } else if (bid.getStatus() == Bid.BidStatus.ACTIVE) {
                    bid.setStatus(Bid.BidStatus.OUTBID);
                }
                bidRepository.save(bid);
            }
        }
    }

    // Get all bids with pagination
    public Page<Bid> getAllBids(Pageable pageable) {
        return bidRepository.findAll(pageable);
    }

    // Private helper methods
    private void validateBid(AuctionItem auction, String bidderId, BigDecimal bidAmount) {
        // Check if auction is active
        if (!auction.isActive()) {
            throw new IllegalStateException("Auction is not active");
        }

        // Check if bidder is not the seller
        if (auction.getSeller().getId().equals(bidderId)) {
            throw new IllegalStateException("Seller cannot bid on their own auction");
        }

        // Check if bid amount is higher than current price
        if (bidAmount.compareTo(auction.getCurrentPrice()) <= 0) {
            throw new IllegalArgumentException(
                    "Bid amount must be higher than current price: " + auction.getCurrentPrice());
        }

        // Check minimum bid increment (e.g., $1)
        BigDecimal minIncrement = new BigDecimal("1.00");
        BigDecimal requiredMinBid = auction.getCurrentPrice().add(minIncrement);
        if (bidAmount.compareTo(requiredMinBid) < 0) {
            throw new IllegalArgumentException("Bid must be at least " + requiredMinBid);
        }

        // Check if auction has ended
        if (auction.hasEnded()) {
            throw new IllegalStateException("Auction has ended");
        }
    }

    private void updatePreviousBidsStatus(AuctionItem auction, BigDecimal newHighestBid) {
        // We need to find the previous "Winning" bid, which is now outbid.
        // We know that the NEW bid (just placed) is the latest one.
        // So we get the top 2 bids by timestamp (latest first).
        // Index 0: New Bid (WINNING)
        // Index 1: Previous Bid (Should be marked OUTBID)

        List<Bid> recentBids = bidRepository.findByAuctionItemOrderByTimestampDesc(auction);

        // Update all non-winning bids to OUTBID just to be safe and consistent
        for (Bid bid : recentBids) {
            // Skip the current winning bid (the new one) based on ID or amount matching
            // newHighestBid
            if (bid.getAmount().compareTo(newHighestBid) == 0 && bid.getStatus() == Bid.BidStatus.WINNING) {
                continue;
            }

            // If it was ACTIVE or WINNING before, and is lower, it's outbid
            if ((bid.getStatus() == Bid.BidStatus.ACTIVE || bid.getStatus() == Bid.BidStatus.WINNING)
                    && bid.getAmount().compareTo(newHighestBid) < 0) {
                bid.setStatus(Bid.BidStatus.OUTBID);
                bidRepository.save(bid);
            }
        }

        // Send delayed notification SPECIFICALLY to the second highest bidder (previous
        // winner)
        if (recentBids.size() >= 2) {
            Bid previousWinningBid = recentBids.get(1);

            // Double check it's not the same user (e.g. self-outbidding logic if allowed,
            // though prevented elsewhere)
            if (previousWinningBid.getBidder() != null) {
                try {
                    // Fetch full user details to ensure email is present
                    Optional<User> userOpt = userService.getUserById(previousWinningBid.getBidder().getId());
                    if (userOpt.isPresent()) {
                        emailService.sendOutbidNotificationEmail(userOpt.get(), auction, newHighestBid);
                    }
                } catch (Exception e) {
                    System.err.println("Error sending outbid email: " + e.getMessage());
                }
            }
        }
    }
}