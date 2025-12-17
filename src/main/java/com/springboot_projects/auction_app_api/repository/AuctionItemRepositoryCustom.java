package com.springboot_projects.auction_app_api.repository;

import com.springboot_projects.auction_app_api.model.AuctionItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface AuctionItemRepositoryCustom {
    Page<AuctionItem> filterAuctions(String searchTerm, String category, AuctionItem.AuctionStatus status,
            BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
}
