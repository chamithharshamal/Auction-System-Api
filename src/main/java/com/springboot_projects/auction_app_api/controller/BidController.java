package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.dto.*;
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
                                                       @RequestBody PlaceBidRequest request) {
        try {
            Bid bid = bidService.placeBid(auctionId, request.getBidderId(), request.getAmount());
            BidDto bidDto = new BidDto(bid);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Bid placed successfully", bidDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get bid by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BidDto>> getBidById(@PathVariable String id) {
        try {
            Optional<Bid> bid = bidService.getBidById(id);
            if (bid.isPresent()) {
                BidDto bidDto = new BidDto(bid.get());
                return ResponseEntity.ok(ApiResponse.success(bidDto));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Bid not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get all bids with pagination
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BidDto>>> getAllBids(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                    Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Bid> bids = bidService.getAllBids(pageable);
            Page<BidDto> bidDtos = bids.map(BidDto::new);
            
            return ResponseEntity.ok(ApiResponse.success(bidDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get bids for auction
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<ApiResponse<Page<BidDto>>> getBidsForAuction(
            @PathVariable String auctionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Optional<AuctionItem> auction = auctionItemService.getAuctionItemById(auctionId);
            if (!auction.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Auction not found"));
            }
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
            Page<Bid> bids = bidService.getBidsForAuction(auction.get(), pageable);
            Page<BidDto> bidDtos = bids.map(BidDto::new);
            
            return ResponseEntity.ok(ApiResponse.success(bidDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get recent bids for auction
    @GetMapping("/auction/{auctionId}/recent")
    public ResponseEntity<ApiResponse<List<BidDto>>> getRecentBidsForAuction(
            @PathVariable String auctionId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<Bid> bids = bidService.getRecentBidsForAuction(auctionId, limit);
            List<BidDto> bidDtos = bids.stream()
                    .map(BidDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(bidDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get highest bid for auction
    @GetMapping("/auction/{auctionId}/highest")
    public ResponseEntity<ApiResponse<BidDto>> getHighestBidForAuction(@PathVariable String auctionId) {
        try {
            Optional<AuctionItem> auction = auctionItemService.getAuctionItemById(auctionId);
            if (!auction.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Auction not found"));
            }
            
            Optional<Bid> highestBid = bidService.getHighestBidForAuction(auction.get());
            if (highestBid.isPresent()) {
                BidDto bidDto = new BidDto(highestBid.get());
                return ResponseEntity.ok(ApiResponse.success(bidDto));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No bids found for this auction"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get bids by bidder
    @GetMapping("/bidder/{bidderId}")
    public ResponseEntity<ApiResponse<Page<BidDto>>> getBidsByBidder(
            @PathVariable String bidderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Optional<User> bidder = userService.getUserById(bidderId);
            if (!bidder.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Bidder not found"));
            }
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
            Page<Bid> bids = bidService.getBidsByBidder(bidder.get(), pageable);
            Page<BidDto> bidDtos = bids.map(BidDto::new);
            
            return ResponseEntity.ok(ApiResponse.success(bidDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get recent bids by bidder
    @GetMapping("/bidder/{bidderId}/recent")
    public ResponseEntity<ApiResponse<List<BidDto>>> getRecentBidsByBidder(
            @PathVariable String bidderId,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Bid> bids = bidService.getRecentBidsByBidder(bidderId, limit);
            List<BidDto> bidDtos = bids.stream()
                    .map(BidDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(bidDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get winning bids for user
    @GetMapping("/bidder/{bidderId}/winning")
    public ResponseEntity<ApiResponse<List<BidDto>>> getWinningBidsForUser(@PathVariable String bidderId) {
        try {
            List<Bid> bids = bidService.getWinningBidsForUser(bidderId);
            List<BidDto> bidDtos = bids.stream()
                    .map(BidDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(bidDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get bids by status
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<BidDto>>> getBidsByStatus(@PathVariable Bid.BidStatus status) {
        try {
            List<Bid> bids = bidService.getBidsByStatus(status);
            List<BidDto> bidDtos = bids.stream()
                    .map(BidDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(bidDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get bids in date range
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<BidDto>>> getBidsInDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            
            List<Bid> bids = bidService.getBidsInDateRange(start, end);
            List<BidDto> bidDtos = bids.stream()
                    .map(BidDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(bidDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get bids in amount range
    @GetMapping("/amount-range")
    public ResponseEntity<ApiResponse<List<BidDto>>> getBidsInAmountRange(
            @RequestParam BigDecimal minAmount,
            @RequestParam BigDecimal maxAmount) {
        try {
            List<Bid> bids = bidService.getBidsInAmountRange(minAmount, maxAmount);
            List<BidDto> bidDtos = bids.stream()
                    .map(BidDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(bidDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Cancel bid
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BidDto>> cancelBid(@PathVariable String id) {
        try {
            Bid cancelledBid = bidService.cancelBid(id);
            BidDto bidDto = new BidDto(cancelledBid);
            
            return ResponseEntity.ok(ApiResponse.success("Bid cancelled successfully", bidDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Check if user has bid on auction
    @GetMapping("/check/{bidderId}/auction/{auctionId}")
    public ResponseEntity<ApiResponse<Boolean>> hasUserBidOnAuction(
            @PathVariable String bidderId,
            @PathVariable String auctionId) {
        try {
            boolean hasBid = bidService.hasUserBidOnAuction(bidderId, auctionId);
            return ResponseEntity.ok(ApiResponse.success("Bid check completed", hasBid));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get bid count for auction
    @GetMapping("/count/auction/{auctionId}")
    public ResponseEntity<ApiResponse<Long>> getBidCountForAuction(@PathVariable String auctionId) {
        try {
            Optional<AuctionItem> auction = auctionItemService.getAuctionItemById(auctionId);
            if (!auction.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Auction not found"));
            }
            
            long count = bidService.getBidCountForAuction(auction.get());
            return ResponseEntity.ok(ApiResponse.success("Bid count for auction", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get bid count for user
    @GetMapping("/count/bidder/{bidderId}")
    public ResponseEntity<ApiResponse<Long>> getBidCountForUser(@PathVariable String bidderId) {
        try {
            Optional<User> bidder = userService.getUserById(bidderId);
            if (!bidder.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Bidder not found"));
            }
            
            long count = bidService.getBidCountForUser(bidder.get());
            return ResponseEntity.ok(ApiResponse.success("Bid count for user", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get all active bids
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BidDto>>> getActiveBids() {
        try {
            List<Bid> bids = bidService.getActiveBids();
            List<BidDto> bidDtos = bids.stream()
                    .map(BidDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(bidDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}