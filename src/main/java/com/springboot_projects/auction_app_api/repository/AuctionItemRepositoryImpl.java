package com.springboot_projects.auction_app_api.repository;

import com.springboot_projects.auction_app_api.model.AuctionItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Repository
public class AuctionItemRepositoryImpl implements AuctionItemRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public Page<AuctionItem> filterAuctions(String searchTerm, String category, AuctionItem.AuctionStatus status,
            BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {

        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        // Search Term (Title or Description)
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            String regex = ".*" + Pattern.quote(searchTerm.trim()) + ".*";
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("title").regex(regex, "i"),
                    Criteria.where("description").regex(regex, "i")));
        }

        // Category
        if (category != null && !category.trim().isEmpty()) {
            criteriaList.add(Criteria.where("category").is(category));
        }

        // Status
        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status));
        }

        // Price Range
        if (minPrice != null && maxPrice != null) {
            criteriaList.add(Criteria.where("currentPrice").gte(minPrice).lte(maxPrice));
        } else if (minPrice != null) {
            criteriaList.add(Criteria.where("currentPrice").gte(minPrice));
        } else if (maxPrice != null) {
            criteriaList.add(Criteria.where("currentPrice").lte(maxPrice));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        // Count total before pagination
        long total = mongoTemplate.count(query, AuctionItem.class);

        // Apply Pagination
        query.with(pageable);

        List<AuctionItem> auctions = mongoTemplate.find(query, AuctionItem.class);

        return new PageImpl<>(auctions, pageable, total);
    }
}
