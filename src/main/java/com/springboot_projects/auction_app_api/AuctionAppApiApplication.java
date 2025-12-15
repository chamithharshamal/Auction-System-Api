package com.springboot_projects.auction_app_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
@org.springframework.scheduling.annotation.EnableAsync
public class AuctionAppApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuctionAppApiApplication.class, args);
	}

}
