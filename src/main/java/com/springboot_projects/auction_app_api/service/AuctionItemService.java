package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.repository.AuctionItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuctionItemService {

    @Autowired
    private AuctionItemRepository auctionItemRepository;

    // Create new auction item
    public AuctionItem createAuctionItem(AuctionItem auctionItem) {
        validateAuctionItemForCreation(auctionItem);
        auctionItem.setCreatedAt(LocalDateTime.now());
        auctionItem.setUpdatedAt(LocalDateTime.now());
        auctionItem.setCurrentPrice(auctionItem.getStartingPrice());
        auctionItem.setStatus(AuctionItem.AuctionStatus.DRAFT);
        return auctionItemRepository.save(auctionItem);
    }

    // Get auction item by ID
    public Optional<AuctionItem> getAuctionItemById(String id) {
        return auctionItemRepository.findById(id);
    }

    // Update auction item
    public AuctionItem updateAuctionItem(String id, AuctionItem updatedItem) {
        Optional<AuctionItem> existingItem = auctionItemRepository.findById(id);
        if (existingItem.isPresent()) {
            AuctionItem item = existingItem.get();

            // Strict Rule: No updates allowed if bids exist
            if (item.getTotalBids() > 0) {
                throw new IllegalStateException("Cannot update auction details after bids have been placed");
            }

            updateAuctionItemFields(item, updatedItem);
            item.setUpdatedAt(LocalDateTime.now());
            return auctionItemRepository.save(item);
        }
        throw new RuntimeException("Auction item not found with id: " + id);
    } // ... (rest of methods)

    private void updateAuctionItemFields(AuctionItem existingItem, AuctionItem updatedItem) {
        if (updatedItem.getTitle() != null) {
            existingItem.setTitle(updatedItem.getTitle());
        }
        if (updatedItem.getDescription() != null) {
            existingItem.setDescription(updatedItem.getDescription());
        }
        if (updatedItem.getCategory() != null) {
            existingItem.setCategory(updatedItem.getCategory());
        }
        if (updatedItem.getImageUrls() != null) {
            existingItem.setImageUrls(updatedItem.getImageUrls());
        }
        if (updatedItem.getReservePrice() != null) {
            existingItem.setReservePrice(updatedItem.getReservePrice());
        }

        // Since we blocked updates if bids > 0, we can now allow date changes freely
        if (updatedItem.getStartDate() != null) {
            existingItem.setStartDate(updatedItem.getStartDate());
        }
        if (updatedItem.getEndDate() != null) {
            // Ensure new end date is in the future
            if (updatedItem.getEndDate().isAfter(LocalDateTime.now())) {
                existingItem.setEndDate(updatedItem.getEndDate());
            } else {
                throw new IllegalArgumentException("End date must be in the future");
            }
        }
    }

    // Start auction
    public AuctionItem startAuction(String auctionId) {
        Optional<AuctionItem> auctionOpt = auctionItemRepository.findById(auctionId);
        if (auctionOpt.isPresent()) {
            AuctionItem auction = auctionOpt.get();
            if (auction.getStatus() == AuctionItem.AuctionStatus.DRAFT) {
                auction.setStatus(AuctionItem.AuctionStatus.ACTIVE);
                auction.setUpdatedAt(LocalDateTime.now());
                return auctionItemRepository.save(auction);
            }
            throw new IllegalStateException("Auction can only be started from DRAFT status");
        }
        throw new RuntimeException("Auction not found with id: " + auctionId);
    }

    // End auction
    public AuctionItem endAuction(String auctionId) {
        Optional<AuctionItem> auctionOpt = auctionItemRepository.findById(auctionId);
        if (auctionOpt.isPresent()) {
            AuctionItem auction = auctionOpt.get();
            if (auction.getStatus() == AuctionItem.AuctionStatus.ACTIVE) {
                auction.setStatus(AuctionItem.AuctionStatus.ENDED);
                auction.setUpdatedAt(LocalDateTime.now());
                return auctionItemRepository.save(auction);
            }
            throw new IllegalStateException("Only active auctions can be ended");
        }
        throw new RuntimeException("Auction not found with id: " + auctionId);
    }

    // Cancel auction
    public AuctionItem cancelAuction(String auctionId) {
        Optional<AuctionItem> auctionOpt = auctionItemRepository.findById(auctionId);
        if (auctionOpt.isPresent()) {
            AuctionItem auction = auctionOpt.get();
            auction.setStatus(AuctionItem.AuctionStatus.CANCELLED);
            auction.setUpdatedAt(LocalDateTime.now());
            return auctionItemRepository.save(auction);
        }
        throw new RuntimeException("Auction not found with id: " + auctionId);
    }

    // Update current price and highest bidder
    public AuctionItem updateCurrentPrice(String auctionId, BigDecimal newPrice, User highestBidder) {
        Optional<AuctionItem> auctionOpt = auctionItemRepository.findById(auctionId);
        if (auctionOpt.isPresent()) {
            AuctionItem auction = auctionOpt.get();
            auction.setCurrentPrice(newPrice);
            auction.setHighestBidder(highestBidder);
            auction.setTotalBids(auction.getTotalBids() + 1);
            auction.setUpdatedAt(LocalDateTime.now());
            return auctionItemRepository.save(auction);
        }
        throw new RuntimeException("Auction not found with id: " + auctionId);
    }

    // Get active auctions
    public List<AuctionItem> getActiveAuctions() {
        return auctionItemRepository.findActiveAuctions(LocalDateTime.now());
    }

    // Get active auctions with pagination
    public Page<AuctionItem> getActiveAuctions(Pageable pageable) {
        return auctionItemRepository.findActiveAuctions(LocalDateTime.now(), pageable);
    }

    // Get auctions ending soon (within next hour)
    public List<AuctionItem> getAuctionsEndingSoon() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourLater = now.plusHours(1);
        return auctionItemRepository.findAuctionsEndingSoon(now, oneHourLater);
    }

    // Get auctions by seller
    public List<AuctionItem> getAuctionsBySeller(User seller) {
        return auctionItemRepository.findBySeller(seller);
    }

    // Get auctions by seller with pagination
    public Page<AuctionItem> getAuctionsBySeller(User seller, Pageable pageable) {
        return auctionItemRepository.findBySeller(seller, pageable);
    }

    // Get auctions by category
    public Page<AuctionItem> getAuctionsByCategory(String category, Pageable pageable) {
        return auctionItemRepository.findByCategory(category, pageable);
    }

    // Search auctions by title or description
    public List<AuctionItem> searchAuctions(String searchTerm) {
        return auctionItemRepository.findByTitleOrDescriptionContainingIgnoreCase(searchTerm);
    }

    // Get auctions by price range
    public Page<AuctionItem> getAuctionsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return auctionItemRepository.findByCurrentPriceBetween(minPrice, maxPrice, pageable);
    }

    // Get top auctions by current price
    public List<AuctionItem> getTopAuctionsByPrice(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "currentPrice"));
        return auctionItemRepository.findTopByCurrentPriceDesc(pageable);
    }

    // Get recently created auctions
    public List<AuctionItem> getRecentlyCreatedAuctions(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return auctionItemRepository.findRecentlyCreated(pageable);
    }

    // Get auctions by status
    public List<AuctionItem> getAuctionsByStatus(AuctionItem.AuctionStatus status) {
        return auctionItemRepository.findByStatus(status);
    }

    // Check if auction is active
    public boolean isAuctionActive(String auctionId) {
        Optional<AuctionItem> auction = auctionItemRepository.findById(auctionId);
        return auction.map(AuctionItem::isActive).orElse(false);
    }

    // Check if auction has ended
    public boolean hasAuctionEnded(String auctionId) {
        Optional<AuctionItem> auction = auctionItemRepository.findById(auctionId);
        return auction.map(AuctionItem::hasEnded).orElse(true);
    }

    // Get auction statistics for seller
    public long getAuctionCountBySeller(User seller) {
        return auctionItemRepository.countBySeller(seller);
    }

    // Get total active auctions count
    public long getActiveAuctionsCount() {
        return auctionItemRepository.countActiveAuctions();
    }

    // Delete auction item
    public void deleteAuctionItem(String auctionId) {
        Optional<AuctionItem> auction = auctionItemRepository.findById(auctionId);
        if (auction.isPresent()) {
            if (auction.get().getStatus() == AuctionItem.AuctionStatus.DRAFT) {
                auctionItemRepository.deleteById(auctionId);
            } else {
                throw new IllegalStateException("Only draft auctions can be deleted");
            }
        } else {
            throw new RuntimeException("Auction not found with id: " + auctionId);
        }
    }

    // Get all auctions with pagination
    public Page<AuctionItem> getAllAuctions(Pageable pageable) {
        return auctionItemRepository.findAll(pageable);
    }

    // Check if current user is the owner of the auction (for security)
    public boolean isAuctionOwner(String currentUsername, String auctionId) {
        Optional<AuctionItem> auction = auctionItemRepository.findById(auctionId);
        if (auction.isPresent()) {
            return auction.get().getSeller().getUsername().equals(currentUsername);
        }
        return false;
    }

    // Private helper methods
    private void validateAuctionItemForCreation(AuctionItem auctionItem) {
        if (auctionItem.getTitle() == null || auctionItem.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }
        if (auctionItem.getDescription() == null || auctionItem.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Description cannot be empty");
        }
        if (auctionItem.getStartingPrice() == null || auctionItem.getStartingPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Starting price must be greater than zero");
        }
        if (auctionItem.getStartDate() == null || auctionItem.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (auctionItem.getEndDate().isBefore(auctionItem.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }
        if (auctionItem.getSeller() == null) {
            throw new IllegalArgumentException("Seller is required");
        }
    }

}