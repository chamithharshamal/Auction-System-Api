package com.springboot_projects.auction_app_api.config;

import com.springboot_projects.auction_app_api.security.CustomUserDetailsService;
import com.springboot_projects.auction_app_api.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/users/check-username/**").permitAll()
                .requestMatchers("/api/users/check-email/**").permitAll()
                
                // User management - Admin access for listing, authenticated for individual access
                .requestMatchers("GET", "/api/users").hasRole("ADMIN")
                .requestMatchers("GET", "/api/users/*").authenticated()
                .requestMatchers("PUT", "/api/users/*").authenticated()
                .requestMatchers("DELETE", "/api/users/*").hasRole("ADMIN")
                
                // Auction endpoints - Role-based access
                .requestMatchers("/api/auctions").permitAll() // View auctions
                .requestMatchers("/api/auctions/active").permitAll()
                .requestMatchers("/api/auctions/search").permitAll()
                .requestMatchers("/api/auctions/category/**").permitAll()
                .requestMatchers("/api/auctions/price-range").permitAll()
                .requestMatchers("/api/auctions/top-by-price").permitAll()
                .requestMatchers("/api/auctions/recent").permitAll()
                .requestMatchers("/api/auctions/{id}").permitAll() // View specific auction
                
                // Auction management - Seller only
                .requestMatchers("POST", "/api/auctions").hasRole("SELLER")
                .requestMatchers("PUT", "/api/auctions/**").hasRole("SELLER")
                .requestMatchers("PATCH", "/api/auctions/**/start").hasRole("SELLER")
                .requestMatchers("PATCH", "/api/auctions/**/end").hasRole("SELLER")
                .requestMatchers("PATCH", "/api/auctions/**/cancel").hasRole("SELLER")
                .requestMatchers("DELETE", "/api/auctions/**").hasRole("SELLER")
                
                // Bidding - Bidder only
                .requestMatchers("POST", "/api/bids/**").hasRole("BIDDER")
                .requestMatchers("PATCH", "/api/bids/**/cancel").hasRole("BIDDER")
                
                // Bid viewing - Authenticated users
                .requestMatchers("GET", "/api/bids/**").authenticated()
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}