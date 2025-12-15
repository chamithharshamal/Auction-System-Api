package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.dto.ApiResponse;
import com.springboot_projects.auction_app_api.dto.PaymentRequest;
import com.springboot_projects.auction_app_api.dto.PaymentResponse;
import com.springboot_projects.auction_app_api.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/process")
    @PreAuthorize("hasRole('BIDDER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @Valid @RequestBody PaymentRequest request,
            Principal principal) {

        PaymentResponse response = paymentService.processPayment(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Payment successful", response));
    }
}
