package com.springboot_projects.auction_app_api;

import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

@Suite
@SuiteDisplayName("Auction API Test Suite")
@SelectPackages({
    "com.springboot_projects.auction_app_api.controller",
    "com.springboot_projects.auction_app_api.service", 
    "com.springboot_projects.auction_app_api.exception",
    "com.springboot_projects.auction_app_api.dto",
    "com.springboot_projects.auction_app_api.integration"
})
public class TestSuite {
    // Test suite configuration
}