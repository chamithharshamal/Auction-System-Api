package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.dto.ApiResponse;
import com.springboot_projects.auction_app_api.dto.SellerAnalyticsResponse;
import com.springboot_projects.auction_app_api.model.User;
import com.springboot_projects.auction_app_api.service.AnalyticsService;
import com.springboot_projects.auction_app_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserService userService;

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<SellerAnalyticsResponse>> getSellerAnalytics(Principal principal) {
        User user = userService.getUserByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        SellerAnalyticsResponse analytics = analyticsService.getSellerAnalytics(user);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
