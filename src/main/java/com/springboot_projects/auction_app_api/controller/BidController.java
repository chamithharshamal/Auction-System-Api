package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.dto.*;
import com.springboot_projects.auction_app_api.exception.AuctionNotFoundException;
import com.springboot_projects.auction_app_api.exception.BidNotFoundException;
import com.springboot_projects.auction_app_api.exception.UserNotFoundException;
import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.Bid;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.service.AuctionItemService;
import com.springboot_projects.auction_app_api.service.BidService;
import com.springboot_projects.auction_app_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bids")
@CrossOrigin(origins = "*")
public class BidController {

    @Autowired
    private BidService bidService;

    @Autowired
    private AuctionItemService auctionItemService;

    @Autowired
    private UserService userService;

    // Place a bid
    @PostMapping("/auction/{auctionId}")
    public ResponseEntity<ApiResponse<BidDto>> placeBid(@PathVariable String auctionId,
            @Valid @RequestBody PlaceBidRequest request) {
        Bid bid = bidService.placeBid(auctionId, request.getBidderId(), request.getAmount());
        BidDto bidDto = new BidDto(bid);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bid placed successfully", bidDto));
    }

    // Get bid by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BidDto>> getBidById(@PathVariable String id) {
        Optional<Bid> bid = bidService.getBidById(id);
        if (bid.isPresent()) {
            BidDto bidDto = new BidDto(bid.get());
            return ResponseEntity.ok(ApiResponse.success(bidDto));
        } else {
            throw new BidNotFoundException("Bid not found with ID: " + id);
        }
    }

    // Get all bids with pagination
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BidDto>>> getAllBids(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Bid> bids = bidService.getAllBids(pageable);
        Page<BidDto> bidDtos = bids.map(BidDto::new);

        return ResponseEntity.ok(ApiResponse.success(bidDtos));
    }

    // Get bids for auction
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<ApiResponse<Page<BidDto>>> getBidsForAuction(
            @PathVariable String auctionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Optional<AuctionItem> auction = auctionItemService.getAuctionItemById(auctionId);
        if (!auction.isPresent()) {
            throw new AuctionNotFoundException("Auction not found with ID: " + auctionId);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<Bid> bids = bidService.getBidsForAuction(auction.get(), pageable);
        Page<BidDto> bidDtos = bids.map(BidDto::new);

        return ResponseEntity.ok(ApiResponse.success(bidDtos));
    }

    // Get recent bids for auction
    @GetMapping("/auction/{auctionId}/recent")
    public ResponseEntity<ApiResponse<List<BidDto>>> getRecentBidsForAuction(
            @PathVariable String auctionId,
            @RequestParam(defaultValue = "5") int limit) {
        List<Bid> bids = bidService.getRecentBidsForAuction(auctionId, limit);
        List<BidDto> bidDtos = bids.stream()
                .map(BidDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(bidDtos));
    }

    // Get price trends for auction
    @GetMapping("/auction/{auctionId}/trends")
    public ResponseEntity<ApiResponse<List<PriceTrendDto>>> getPriceTrends(@PathVariable String auctionId) {
        List<PriceTrendDto> trends = bidService.getPriceTrendsForAuction(auctionId);
        return ResponseEntity.ok(ApiResponse.success(trends));
    }

    // Get highest bid for auction
    @GetMapping("/auction/{auctionId}/highest")
    public ResponseEntity<ApiResponse<BidDto>> getHighestBidForAuction(@PathVariable String auctionId) {
        Optional<AuctionItem> auction = auctionItemService.getAuctionItemById(auctionId);
        if (!auction.isPresent()) {
            throw new AuctionNotFoundException("Auction not found with ID: " + auctionId);
        }

        Optional<Bid> highestBid = bidService.getHighestBidForAuction(auction.get());
        if (highestBid.isPresent()) {
            BidDto bidDto = new BidDto(highestBid.get());
            return ResponseEntity.ok(ApiResponse.success(bidDto));
        } else {
            throw new BidNotFoundException("No bids found for auction: " + auctionId);
        }
    }

    // Get bids by bidder
    @GetMapping("/bidder/{bidderId}")
    public ResponseEntity<ApiResponse<Page<BidDto>>> getBidsByBidder(
            @PathVariable String bidderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Optional<User> bidder = userService.getUserById(bidderId);
        if (!bidder.isPresent()) {
            throw new UserNotFoundException("User not found with ID: " + bidderId);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<Bid> bids = bidService.getBidsByBidder(bidder.get(), pageable);
        Page<BidDto> bidDtos = bids.map(BidDto::new);

        return ResponseEntity.ok(ApiResponse.success(bidDtos));
    }

    // Get recent bids by bidder
    @GetMapping("/bidder/{bidderId}/recent")
    public ResponseEntity<ApiResponse<List<BidDto>>> getRecentBidsByBidder(
            @PathVariable String bidderId,
            @RequestParam(defaultValue = "10") int limit) {
        List<Bid> bids = bidService.getRecentBidsByBidder(bidderId, limit);
        List<BidDto> bidDtos = bids.stream()
                .map(BidDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(bidDtos));
    }

    // Get winning bids for user
    @GetMapping("/bidder/{bidderId}/winning")
    public ResponseEntity<ApiResponse<List<BidDto>>> getWinningBidsForUser(@PathVariable String bidderId) {
        List<Bid> bids = bidService.getWinningBidsForUser(bidderId);
        List<BidDto> bidDtos = bids.stream()
                .map(BidDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(bidDtos));
    }

    // Get bids by status
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<BidDto>>> getBidsByStatus(@PathVariable Bid.BidStatus status) {
        List<Bid> bids = bidService.getBidsByStatus(status);
        List<BidDto> bidDtos = bids.stream()
                .map(BidDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(bidDtos));
    }

    // Get bids in date range
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<BidDto>>> getBidsInDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);

        List<Bid> bids = bidService.getBidsInDateRange(start, end);
        List<BidDto> bidDtos = bids.stream()
                .map(BidDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(bidDtos));
    }

    // Get bids in amount range
    @GetMapping("/amount-range")
    public ResponseEntity<ApiResponse<List<BidDto>>> getBidsInAmountRange(
            @RequestParam BigDecimal minAmount,
            @RequestParam BigDecimal maxAmount) {
        List<Bid> bids = bidService.getBidsInAmountRange(minAmount, maxAmount);
        List<BidDto> bidDtos = bids.stream()
                .map(BidDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(bidDtos));
    }

    // Cancel bid
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BidDto>> cancelBid(@PathVariable String id) {
        Bid cancelledBid = bidService.cancelBid(id);
        BidDto bidDto = new BidDto(cancelledBid);

        return ResponseEntity.ok(ApiResponse.success("Bid cancelled successfully", bidDto));
    }

    // Check if user has bid on auction
    @GetMapping("/check/{bidderId}/auction/{auctionId}")
    public ResponseEntity<ApiResponse<Boolean>> hasUserBidOnAuction(
            @PathVariable String bidderId,
            @PathVariable String auctionId) {
        boolean hasBid = bidService.hasUserBidOnAuction(bidderId, auctionId);
        return ResponseEntity.ok(ApiResponse.success("Bid check completed", hasBid));
    }

    // Get bid count for auction
    @GetMapping("/count/auction/{auctionId}")
    public ResponseEntity<ApiResponse<Long>> getBidCountForAuction(@PathVariable String auctionId) {
        Optional<AuctionItem> auction = auctionItemService.getAuctionItemById(auctionId);
        if (!auction.isPresent()) {
            throw new AuctionNotFoundException("Auction not found with ID: " + auctionId);
        }

        long count = bidService.getBidCountForAuction(auction.get());
        return ResponseEntity.ok(ApiResponse.success("Bid count for auction", count));
    }

    // Get bid count for user
    @GetMapping("/count/bidder/{bidderId}")
    public ResponseEntity<ApiResponse<Long>> getBidCountForUser(@PathVariable String bidderId) {
        Optional<User> bidder = userService.getUserById(bidderId);
        if (!bidder.isPresent()) {
            throw new UserNotFoundException("User not found with ID: " + bidderId);
        }

        long count = bidService.getBidCountForUser(bidder.get());
        return ResponseEntity.ok(ApiResponse.success("Bid count for user", count));
    }

    // Get all active bids
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BidDto>>> getActiveBids() {
        List<Bid> bids = bidService.getActiveBids();
        List<BidDto> bidDtos = bids.stream()
                .map(BidDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(bidDtos));
    }
}