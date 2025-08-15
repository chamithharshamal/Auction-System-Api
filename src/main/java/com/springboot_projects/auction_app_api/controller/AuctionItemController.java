package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.dto.*;
import com.springboot_projects.auction_app_api.exception.AuctionNotFoundException;
import com.springboot_projects.auction_app_api.exception.UserNotFoundException;
import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.service.AuctionItemService;
import com.springboot_projects.auction_app_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auctions")
@CrossOrigin(origins = "*")
public class AuctionItemController {
    
    @Autowired
    private AuctionItemService auctionItemService;
    
    @Autowired
    private UserService userService;
    
    // Create new auction
    @PostMapping
    public ResponseEntity<ApiResponse<AuctionItemDto>> createAuction(@Valid @RequestBody CreateAuctionRequest request) {
        Optional<User> seller = userService.getUserById(request.getSellerId());
        if (!seller.isPresent()) {
            throw new UserNotFoundException("Seller not found with ID: " + request.getSellerId());
        }
        
        AuctionItem auctionItem = new AuctionItem();
        auctionItem.setTitle(request.getTitle());
        auctionItem.setDescription(request.getDescription());
        auctionItem.setCategory(request.getCategory());
        auctionItem.setImageUrls(request.getImageUrls());
        auctionItem.setStartingPrice(request.getStartingPrice());
        auctionItem.setReservePrice(request.getReservePrice());
        auctionItem.setStartDate(request.getStartDate());
        auctionItem.setEndDate(request.getEndDate());
        auctionItem.setSeller(seller.get());
        
        AuctionItem createdAuction = auctionItemService.createAuctionItem(auctionItem);
        AuctionItemDto auctionDto = new AuctionItemDto(createdAuction);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Auction created successfully", auctionDto));
    }
    
    // Get auction by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuctionItemDto>> getAuctionById(@PathVariable String id) {
        Optional<AuctionItem> auction = auctionItemService.getAuctionItemById(id);
        if (auction.isPresent()) {
            AuctionItemDto auctionDto = new AuctionItemDto(auction.get());
            return ResponseEntity.ok(ApiResponse.success(auctionDto));
        } else {
            throw new AuctionNotFoundException("Auction not found with ID: " + id);
        }
    }
    
    // Update auction
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') and @auctionItemService.isAuctionOwner(authentication.name, #id)")
    public ResponseEntity<ApiResponse<AuctionItemDto>> updateAuction(@PathVariable String id, 
                                                                    @Valid @RequestBody UpdateAuctionRequest request) {
        AuctionItem updateData = new AuctionItem();
        updateData.setTitle(request.getTitle());
        updateData.setDescription(request.getDescription());
        updateData.setCategory(request.getCategory());
        updateData.setImageUrls(request.getImageUrls());
        updateData.setReservePrice(request.getReservePrice());
        updateData.setStartDate(request.getStartDate());
        updateData.setEndDate(request.getEndDate());
        
        AuctionItem updatedAuction = auctionItemService.updateAuctionItem(id, updateData);
        AuctionItemDto auctionDto = new AuctionItemDto(updatedAuction);
        
        return ResponseEntity.ok(ApiResponse.success("Auction updated successfully", auctionDto));
    }
    
    // Get all auctions with pagination
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuctionItemDto>>> getAllAuctions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<AuctionItem> auctions = auctionItemService.getAllAuctions(pageable);
        Page<AuctionItemDto> auctionDtos = auctions.map(AuctionItemDto::new);
        
        return ResponseEntity.ok(ApiResponse.success(auctionDtos));
    }
    
    // Get active auctions
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<Page<AuctionItemDto>>> getActiveAuctions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("endDate").ascending());
        Page<AuctionItem> auctions = auctionItemService.getActiveAuctions(pageable);
        Page<AuctionItemDto> auctionDtos = auctions.map(AuctionItemDto::new);
        
        return ResponseEntity.ok(ApiResponse.success(auctionDtos));
    }
    
    // Get auctions ending soon
    @GetMapping("/ending-soon")
    public ResponseEntity<ApiResponse<List<AuctionItemDto>>> getAuctionsEndingSoon() {
        List<AuctionItem> auctions = auctionItemService.getAuctionsEndingSoon();
        List<AuctionItemDto> auctionDtos = auctions.stream()
                .map(AuctionItemDto::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(auctionDtos));
    }
    
    // Get auctions by seller
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<ApiResponse<Page<AuctionItemDto>>> getAuctionsBySeller(
            @PathVariable String sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Optional<User> seller = userService.getUserById(sellerId);
        if (!seller.isPresent()) {
            throw new UserNotFoundException("Seller not found with ID: " + sellerId);
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuctionItem> auctions = auctionItemService.getAuctionsBySeller(seller.get(), pageable);
        Page<AuctionItemDto> auctionDtos = auctions.map(AuctionItemDto::new);
        
        return ResponseEntity.ok(ApiResponse.success(auctionDtos));
    }
    
    // Get auctions by category
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Page<AuctionItemDto>>> getAuctionsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<AuctionItem> auctions = auctionItemService.getAuctionsByCategory(category, pageable);
            Page<AuctionItemDto> auctionDtos = auctions.map(AuctionItemDto::new);
            
            return ResponseEntity.ok(ApiResponse.success(auctionDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Search auctions
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<AuctionItemDto>>> searchAuctions(@RequestParam String query) {
        try {
            List<AuctionItem> auctions = auctionItemService.searchAuctions(query);
            List<AuctionItemDto> auctionDtos = auctions.stream()
                    .map(AuctionItemDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(auctionDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get auctions by price range
    @GetMapping("/price-range")
    public ResponseEntity<ApiResponse<Page<AuctionItemDto>>> getAuctionsByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("currentPrice").ascending());
            Page<AuctionItem> auctions = auctionItemService.getAuctionsByPriceRange(minPrice, maxPrice, pageable);
            Page<AuctionItemDto> auctionDtos = auctions.map(AuctionItemDto::new);
            
            return ResponseEntity.ok(ApiResponse.success(auctionDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get top auctions by price
    @GetMapping("/top-by-price")
    public ResponseEntity<ApiResponse<List<AuctionItemDto>>> getTopAuctionsByPrice(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<AuctionItem> auctions = auctionItemService.getTopAuctionsByPrice(limit);
            List<AuctionItemDto> auctionDtos = auctions.stream()
                    .map(AuctionItemDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(auctionDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get recently created auctions
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<AuctionItemDto>>> getRecentAuctions(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<AuctionItem> auctions = auctionItemService.getRecentlyCreatedAuctions(limit);
            List<AuctionItemDto> auctionDtos = auctions.stream()
                    .map(AuctionItemDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(auctionDtos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Start auction
    @PatchMapping("/{id}/start")
    @PreAuthorize("hasRole('SELLER') and @auctionItemService.isAuctionOwner(authentication.name, #id)")
    public ResponseEntity<ApiResponse<AuctionItemDto>> startAuction(@PathVariable String id) {
        try {
            AuctionItem auction = auctionItemService.startAuction(id);
            AuctionItemDto auctionDto = new AuctionItemDto(auction);
            
            return ResponseEntity.ok(ApiResponse.success("Auction started successfully", auctionDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // End auction
    @PatchMapping("/{id}/end")
    @PreAuthorize("hasRole('SELLER') and @auctionItemService.isAuctionOwner(authentication.name, #id)")
    public ResponseEntity<ApiResponse<AuctionItemDto>> endAuction(@PathVariable String id) {
        try {
            AuctionItem auction = auctionItemService.endAuction(id);
            AuctionItemDto auctionDto = new AuctionItemDto(auction);
            
            return ResponseEntity.ok(ApiResponse.success("Auction ended successfully", auctionDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Cancel auction
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('SELLER') and @auctionItemService.isAuctionOwner(authentication.name, #id)")
    public ResponseEntity<ApiResponse<AuctionItemDto>> cancelAuction(@PathVariable String id) {
        try {
            AuctionItem auction = auctionItemService.cancelAuction(id);
            AuctionItemDto auctionDto = new AuctionItemDto(auction);
            
            return ResponseEntity.ok(ApiResponse.success("Auction cancelled successfully", auctionDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Delete auction
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') and @auctionItemService.isAuctionOwner(authentication.name, #id)")
    public ResponseEntity<ApiResponse<Void>> deleteAuction(@PathVariable String id) {
        try {
            auctionItemService.deleteAuctionItem(id);
            return ResponseEntity.ok(ApiResponse.success("Auction deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get auction statistics
    @GetMapping("/stats/seller/{sellerId}")
    public ResponseEntity<ApiResponse<Long>> getSellerAuctionCount(@PathVariable String sellerId) {
        try {
            Optional<User> seller = userService.getUserById(sellerId);
            if (!seller.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Seller not found"));
            }
            
            long count = auctionItemService.getAuctionCountBySeller(seller.get());
            return ResponseEntity.ok(ApiResponse.success("Seller auction count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get total active auctions count
    @GetMapping("/stats/active-count")
    public ResponseEntity<ApiResponse<Long>> getActiveAuctionsCount() {
        try {
            long count = auctionItemService.getActiveAuctionsCount();
            return ResponseEntity.ok(ApiResponse.success("Active auctions count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}