package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.model.Watchlist;
import com.springboot_projects.auction_app_api.repository.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchlistService {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Transactional
    public void addToWatchlist(User user, AuctionItem auctionItem) {
        if (!watchlistRepository.existsByUserAndAuctionItem(user, auctionItem)) {
            Watchlist watchlist = new Watchlist(user, auctionItem);
            watchlistRepository.save(watchlist);
        }
    }

    @Transactional
    public void removeFromWatchlist(User user, AuctionItem auctionItem) {
        watchlistRepository.deleteByUserAndAuctionItem(user, auctionItem);
    }

    public boolean isWatched(User user, AuctionItem auctionItem) {
        return watchlistRepository.existsByUserAndAuctionItem(user, auctionItem);
    }

    public List<AuctionItem> getUserWatchlist(User user) {
        return watchlistRepository.findByUser(user).stream()
                .map(Watchlist::getAuctionItem)
                .collect(Collectors.toList());
    }
}
