package com.springboot_projects.auction_app_api.repository;

import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.Bid;
import com.springboot_projects.auction_app_api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends MongoRepository<Bid, String> {
    
    // Find bids by auction item
    List<Bid> findByAuctionItem(AuctionItem auctionItem);
    
    // Find bids by auction item with pagination
    Page<Bid> findByAuctionItem(AuctionItem auctionItem, Pageable pageable);
    
    // Find bids by auction item ordered by amount descending
    List<Bid> findByAuctionItemOrderByAmountDesc(AuctionItem auctionItem);
    
    // Find bids by auction item ordered by timestamp descending
    List<Bid> findByAuctionItemOrderByTimestampDesc(AuctionItem auctionItem);
    
    // Find bids by bidder
    List<Bid> findByBidder(User bidder);
    
    // Find bids by bidder with pagination
    Page<Bid> findByBidder(User bidder, Pageable pageable);
    
    // Find bids by bidder ordered by timestamp descending
    List<Bid> findByBidderOrderByTimestampDesc(User bidder);
    
    // Find highest bid for an auction item
    Optional<Bid> findTopByAuctionItemOrderByAmountDesc(AuctionItem auctionItem);
    
    // Find latest bid for an auction item
    Optional<Bid> findTopByAuctionItemOrderByTimestampDesc(AuctionItem auctionItem);
    
    // Find bids by status
    List<Bid> findByStatus(Bid.BidStatus status);
    
    // Find winning bids
    List<Bid> findByStatus(Bid.BidStatus status, Pageable pageable);
    
    // Find bids by amount range
    @Query("{'amount': {'$gte': ?0, '$lte': ?1}}")
    List<Bid> findByAmountBetween(BigDecimal minAmount, BigDecimal maxAmount);
    
    // Find bids by date range
    @Query("{'timestamp': {'$gte': ?0, '$lte': ?1}}")
    List<Bid> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find bids by bidder and auction item
    List<Bid> findByBidderAndAuctionItem(User bidder, AuctionItem auctionItem);
    
    // Find bids by bidder and auction item ordered by timestamp descending
    List<Bid> findByBidderAndAuctionItemOrderByTimestampDesc(User bidder, AuctionItem auctionItem);
    
    // Find bids greater than amount for auction item
    @Query("{'auctionItem': ?0, 'amount': {'$gt': ?1}}")
    List<Bid> findByAuctionItemAndAmountGreaterThan(AuctionItem auctionItem, BigDecimal amount);
    
    // Count bids by auction item
    long countByAuctionItem(AuctionItem auctionItem);
    
    // Count bids by bidder
    long countByBidder(User bidder);
    
    // Find recent bids for auction item
    @Query(value = "{'auctionItem': ?0}", sort = "{'timestamp': -1}")
    List<Bid> findRecentBidsByAuctionItem(AuctionItem auctionItem, Pageable pageable);
    
    // Find user's recent bids
    @Query(value = "{'bidder': ?0}", sort = "{'timestamp': -1}")
    List<Bid> findRecentBidsByBidder(User bidder, Pageable pageable);
    
    // Check if user has bid on auction item
    boolean existsByBidderAndAuctionItem(User bidder, AuctionItem auctionItem);
    
    // Find all bids for auction items by seller
    @Query("{'auctionItem.seller': ?0}")
    List<Bid> findBidsForSellerAuctions(User seller);
    
    // Find active bids (not outbid or cancelled)
    @Query("{'status': {'$in': ['ACTIVE', 'WINNING']}}")
    List<Bid> findActiveBids();
    
    // Find outbid bids that need status update
    @Query("{'status': 'ACTIVE', 'auctionItem': ?0, 'amount': {'$lt': ?1}}")
    List<Bid> findOutbidBids(AuctionItem auctionItem, BigDecimal currentHighestBid);
}