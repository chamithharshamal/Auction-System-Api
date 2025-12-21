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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.http.HttpMethod;

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
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("*");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers("/", "/index.html", "/static/**", "/favicon.ico").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/users/check-username/**").permitAll()
                        .requestMatchers("/api/users/check-email/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        // Bid viewing - Public access for viewing bids (Explicitly permissive)
                        .requestMatchers(HttpMethod.GET, "/api/bids/auction/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/bids/auction/*/recent").permitAll()

                        // Files - Public access for viewing images
                        .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()

                        // User management - Admin access for listing, authenticated for individual
                        // access
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/*").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/users/*").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/users/*").hasRole("ADMIN")

                        // Auction endpoints - Role-based access
                        .requestMatchers("/api/auctions").permitAll() // View auctions
                        .requestMatchers("/api/auctions/active").permitAll()
                        .requestMatchers("/api/auctions/search").permitAll()
                        .requestMatchers("/api/auctions/category/**").permitAll()
                        .requestMatchers("/api/auctions/price-range").permitAll()
                        .requestMatchers("/api/auctions/top-by-price").permitAll()
                        .requestMatchers("/api/auctions/recent").permitAll()
                        .requestMatchers("/api/auctions/ending-soon").permitAll()
                        .requestMatchers("/api/auctions/{id}").permitAll() // View specific auction

                        // Auction management - Seller or Bidder (Allowing Bidders to become Sellers)
                        .requestMatchers(HttpMethod.POST, "/api/auctions").hasAnyRole("SELLER", "BIDDER")
                        .requestMatchers(HttpMethod.PUT, "/api/auctions/*").hasAnyRole("SELLER", "BIDDER")
                        .requestMatchers(HttpMethod.PATCH, "/api/auctions/*/start").hasAnyRole("SELLER", "BIDDER")
                        .requestMatchers(HttpMethod.PATCH, "/api/auctions/*/end").hasAnyRole("SELLER", "BIDDER")
                        .requestMatchers(HttpMethod.PATCH, "/api/auctions/*/cancel").hasAnyRole("SELLER", "BIDDER")
                        .requestMatchers(HttpMethod.DELETE, "/api/auctions/*").hasAnyRole("SELLER", "BIDDER")

                        // Bidding - Bidder only
                        .requestMatchers(HttpMethod.POST, "/api/bids/**").hasRole("BIDDER")
                        .requestMatchers(HttpMethod.PATCH, "/api/bids/*/cancel").hasRole("BIDDER")

                        // Bid viewing - Public access for viewing bids
                        // Bid viewing - Public access for viewing bids
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/bids/**").authenticated()

                        // Payment
                        .requestMatchers("/api/payment/**").hasRole("BIDDER")

                        // All other requests require authentication
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}