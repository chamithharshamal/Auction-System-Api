package com.springboot_projects.auction_app_api.repository;

import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.model.Watchlist;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface WatchlistRepository extends MongoRepository<Watchlist, String> {
    List<Watchlist> findByUser(User user);

    boolean existsByUserAndAuctionItem(User user, AuctionItem auctionItem);

    void deleteByUserAndAuctionItem(User user, AuctionItem auctionItem);
}
