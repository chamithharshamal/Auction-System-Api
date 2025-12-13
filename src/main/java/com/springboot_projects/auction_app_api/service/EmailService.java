package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.config.EmailConfig;
import com.springboot_projects.auction_app_api.model.AuctionItem;
import com.springboot_projects.auction_app_api.model.Bid;
import com.springboot_projects.auction_app_api.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Autowired
    private EmailConfig emailConfig;

    @Async
    public void sendWelcomeEmail(User user) {
        if (!emailConfig.isEnabled()) {
            logger.info("Email notifications are disabled");
            return;
        }

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("userName", user.getFirstName() + " " + user.getLastName());
            variables.put("username", user.getUsername());
            variables.put("baseUrl", emailConfig.getBaseUrl());

            String subject = "Welcome to Auction App!";
            String template = "welcome-email";

            sendHtmlEmail(user.getEmail(), subject, template, variables);

            logger.info("Welcome email sent to: {}", user.getEmail());

        } catch (Exception e) {
            logger.error("Failed to send welcome email to: {}", user.getEmail(), e);
        }
    }

    @Async
    public void sendBidConfirmationEmail(User bidder, Bid bid, AuctionItem auction) {
        if (!emailConfig.isEnabled())
            return;

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("bidderName", bidder.getFirstName() + " " + bidder.getLastName());
            variables.put("auctionTitle", auction.getTitle());
            variables.put("bidAmount", bid.getAmount());
            variables.put("bidTime", bid.getTimestamp().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")));
            variables.put("auctionUrl", emailConfig.getBaseUrl() + "/auctions/" + auction.getId());

            String subject = "Bid Confirmation - " + auction.getTitle();
            String template = "bid-confirmation-email";

            sendHtmlEmail(bidder.getEmail(), subject, template, variables);

            logger.info("Bid confirmation email sent to: {}", bidder.getEmail());

        } catch (Exception e) {
            logger.error("Failed to send bid confirmation email to: {}", bidder.getEmail(), e);
        }
    }

    @Async
    public void sendOutbidNotificationEmail(User outbidUser, AuctionItem auction, BigDecimal newHighestBid) {
        if (!emailConfig.isEnabled())
            return;

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("userName", outbidUser.getFirstName() + " " + outbidUser.getLastName());
            variables.put("auctionTitle", auction.getTitle());
            variables.put("newHighestBid", newHighestBid);
            variables.put("auctionUrl", emailConfig.getBaseUrl() + "/auctions/" + auction.getId());
            variables.put("endTime", auction.getEndDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")));

            String subject = "You've been outbid - " + auction.getTitle();
            String template = "outbid-notification-email";

            sendHtmlEmail(outbidUser.getEmail(), subject, template, variables);

            logger.info("Outbid notification email sent to: {}", outbidUser.getEmail());

        } catch (Exception e) {
            logger.error("Failed to send outbid notification email to: {}", outbidUser.getEmail(), e);
        }
    }

    @Async
    public void sendAuctionEndingReminderEmail(User user, AuctionItem auction, int hoursRemaining) {
        if (!emailConfig.isEnabled())
            return;

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("userName", user.getFirstName() + " " + user.getLastName());
            variables.put("auctionTitle", auction.getTitle());
            variables.put("hoursRemaining", hoursRemaining);
            variables.put("currentPrice", auction.getCurrentPrice());
            variables.put("auctionUrl", emailConfig.getBaseUrl() + "/auctions/" + auction.getId());
            variables.put("endTime", auction.getEndDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")));

            String subject = "Auction ending soon - " + auction.getTitle();
            String template = "auction-ending-reminder-email";

            sendHtmlEmail(user.getEmail(), subject, template, variables);

            logger.info("Auction ending reminder email sent to: {}", user.getEmail());

        } catch (Exception e) {
            logger.error("Failed to send auction ending reminder email to: {}", user.getEmail(), e);
        }
    }

    @Async
    public void sendAuctionWonEmail(User winner, AuctionItem auction, Bid winningBid) {
        if (!emailConfig.isEnabled())
            return;

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("winnerName", winner.getFirstName() + " " + winner.getLastName());
            variables.put("auctionTitle", auction.getTitle());
            variables.put("winningBid", winningBid.getAmount());
            variables.put("auctionUrl", emailConfig.getBaseUrl() + "/auctions/" + auction.getId());
            variables.put("sellerContact", auction.getSeller().getEmail());

            String subject = "Congratulations! You won - " + auction.getTitle();
            String template = "auction-won-email";

            sendHtmlEmail(winner.getEmail(), subject, template, variables);

            logger.info("Auction won email sent to: {}", winner.getEmail());

        } catch (Exception e) {
            logger.error("Failed to send auction won email to: {}", winner.getEmail(), e);
        }
    }

    @Async
    public void sendAuctionEndedEmail(User seller, AuctionItem auction) {
        if (!emailConfig.isEnabled())
            return;

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("sellerName", seller.getFirstName() + " " + seller.getLastName());
            variables.put("auctionTitle", auction.getTitle());
            variables.put("finalPrice", auction.getCurrentPrice());
            variables.put("totalBids", auction.getTotalBids());
            variables.put("auctionUrl", emailConfig.getBaseUrl() + "/auctions/" + auction.getId());

            if (auction.getHighestBidder() != null) {
                variables.put("hasWinner", true);
                variables.put("winnerContact", auction.getHighestBidder().getEmail());
            } else {
                variables.put("hasWinner", false);
            }

            String subject = "Your auction has ended - " + auction.getTitle();
            String template = "auction-ended-seller-email";

            sendHtmlEmail(seller.getEmail(), subject, template, variables);

            logger.info("Auction ended email sent to seller: {}", seller.getEmail());

        } catch (Exception e) {
            logger.error("Failed to send auction ended email to seller: {}", seller.getEmail(), e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String template, Map<String, Object> variables)
            throws MessagingException {

        if (mailSender == null) {
            logger.warn("JavaMailSender is not available (Dev Mode), skipping email: '{}' to '{}'", subject, to);
            return;
        }

        // Check if we have actual credentials (simple check)
        if (emailConfig.getFromEmail() == null || emailConfig.getFromEmail().contains("example.com")
                || emailConfig.getFromEmail().isEmpty()) {
            logger.info("[DEV MODE] Email would be sent to: {} with subject: {}", to, subject);
            logger.info("[DEV MODE] Email Content Preview: {}...", variables.toString());
            return;
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        // Set email properties
        try {
            helper.setFrom(emailConfig.getFromEmail(), emailConfig.getFromName());
        } catch (UnsupportedEncodingException e) {
            // Fallback to simple setFrom if encoding fails
            logger.warn("Failed to set from name with encoding, using simple from: {}", e.getMessage());
            helper.setFrom(emailConfig.getFromEmail());
        }

        helper.setTo(to);
        helper.setSubject(subject);

        // Process template
        Context context = new Context();
        context.setVariables(variables);
        String htmlContent = templateEngine.process(template, context);

        helper.setText(htmlContent, true);

        // Send email
        mailSender.send(message);
    }

    @Async
    public void sendSimpleEmail(String to, String subject, String text) {
        if (!emailConfig.isEnabled() || mailSender == null)
            return;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(emailConfig.getFromEmail());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);

            logger.info("Simple email sent to: {}", to);

        } catch (Exception e) {
            logger.error("Failed to send simple email to: {}", to, e);
        }
    }
}