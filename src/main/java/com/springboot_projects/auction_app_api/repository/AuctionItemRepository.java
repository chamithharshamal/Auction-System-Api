package com.springboot_projects.auction_app_api.repository;

import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuctionItemRepository extends MongoRepository<AuctionItem, String>, AuctionItemRepositoryCustom {

    // Find by seller
    List<AuctionItem> findBySeller(User seller);

    // Find by seller with pagination
    Page<AuctionItem> findBySeller(User seller, Pageable pageable);

    // Find by status
    List<AuctionItem> findByStatus(AuctionItem.AuctionStatus status);

    // Find active auctions
    @Query("{'status': 'ACTIVE', 'startDate': {'$lte': ?0}, 'endDate': {'$gte': ?0}}")
    List<AuctionItem> findActiveAuctions(LocalDateTime currentTime);

    // Find active auctions with pagination
    @Query("{'status': 'ACTIVE', 'startDate': {'$lte': ?0}, 'endDate': {'$gte': ?0}}")
    Page<AuctionItem> findActiveAuctions(LocalDateTime currentTime, Pageable pageable);

    // Find auctions ending soon
    @Query("{'status': 'ACTIVE', 'endDate': {'$gte': ?0, '$lte': ?1}}")
    List<AuctionItem> findAuctionsEndingSoon(LocalDateTime from, LocalDateTime to);

    // Find by category
    List<AuctionItem> findByCategory(String category);

    // Find by category with pagination
    Page<AuctionItem> findByCategory(String category, Pageable pageable);

    // Find by title containing (case insensitive)
    @Query("{'title': {'$regex': ?0, '$options': 'i'}}")
    List<AuctionItem> findByTitleContainingIgnoreCase(String title);

    // Find by title or description containing (case insensitive)
    @Query("{'$or': [{'title': {'$regex': ?0, '$options': 'i'}}, {'description': {'$regex': ?0, '$options': 'i'}}]}")
    List<AuctionItem> findByTitleOrDescriptionContainingIgnoreCase(String searchTerm);

    // Find by price range
    @Query("{'currentPrice': {'$gte': ?0, '$lte': ?1}}")
    List<AuctionItem> findByCurrentPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    // Find by price range with pagination
    @Query("{'currentPrice': {'$gte': ?0, '$lte': ?1}}")
    Page<AuctionItem> findByCurrentPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    // Find auctions by date range
    @Query("{'startDate': {'$gte': ?0}, 'endDate': {'$lte': ?1}}")
    List<AuctionItem> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    // Find auctions with highest bids
    @Query(value = "{}", sort = "{'currentPrice': -1}")
    List<AuctionItem> findTopByCurrentPriceDesc(Pageable pageable);

    // Find recently created auctions
    @Query(value = "{}", sort = "{'createdAt': -1}")
    List<AuctionItem> findRecentlyCreated(Pageable pageable);

    // Find auctions by seller and status
    List<AuctionItem> findBySellerAndStatus(User seller, AuctionItem.AuctionStatus status);

    // Count auctions by seller
    long countBySeller(User seller);

    // Count active auctions
    @Query(value = "{'status': 'ACTIVE'}", count = true)
    long countActiveAuctions();

    // Find auctions with reserve price not met
    @Query("{'reservePrice': {'$gt': '$currentPrice'}}")
    List<AuctionItem> findAuctionsWithReservePriceNotMet();

    // Find active auctions that have expired
    List<AuctionItem> findByEndDateBeforeAndStatus(LocalDateTime now, AuctionItem.AuctionStatus status);

    // Find pending auctions that should start
    List<AuctionItem> findByStartDateBeforeAndStatus(LocalDateTime now, AuctionItem.AuctionStatus status);
}