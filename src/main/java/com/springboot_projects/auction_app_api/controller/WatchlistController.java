package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.service.AuctionItemService;
import com.springboot_projects.auction_app_api.service.UserService;
import com.springboot_projects.auction_app_api.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/watchlist")
@CrossOrigin(origins = "*", maxAge = 3600)
public class WatchlistController {

    @Autowired
    private WatchlistService watchlistService;

    @Autowired
    private UserService userService;

    @Autowired
    private AuctionItemService auctionItemService;

    @PostMapping("/{auctionId}")
    public ResponseEntity<?> addToWatchlist(@PathVariable String auctionId, Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<AuctionItem> auctionOpt = auctionItemService.getAuctionItemById(auctionId);
        if (auctionOpt.isPresent()) {
            watchlistService.addToWatchlist(user, auctionOpt.get());
            return ResponseEntity.ok().body("Added to watchlist");
        }
        return ResponseEntity.badRequest().body("Auction not found");
    }

    @DeleteMapping("/{auctionId}")
    public ResponseEntity<?> removeFromWatchlist(@PathVariable String auctionId, Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<AuctionItem> auctionOpt = auctionItemService.getAuctionItemById(auctionId);
        if (auctionOpt.isPresent()) {
            watchlistService.removeFromWatchlist(user, auctionOpt.get());
            return ResponseEntity.ok().body("Removed from watchlist");
        }
        return ResponseEntity.badRequest().body("Auction not found");
    }

    @GetMapping
    public ResponseEntity<List<AuctionItem>> getWatchlist(Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(watchlistService.getUserWatchlist(user));
    }

    @GetMapping("/check/{auctionId}")
    public ResponseEntity<Boolean> isWatched(@PathVariable String auctionId, Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<AuctionItem> auctionOpt = auctionItemService.getAuctionItemById(auctionId);
        if (auctionOpt.isPresent()) {
            return ResponseEntity.ok(watchlistService.isWatched(user, auctionOpt.get()));
        }
        return ResponseEntity.badRequest().build();
    }
}
