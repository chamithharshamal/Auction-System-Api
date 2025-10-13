// Simple script to insert sample auction data
// Run this in MongoDB Compass or mongo shell

use auction_system;

// First, let's create a sample seller user
const seller = {
  username: "test_seller",
  email: "seller@example.com",
  password: "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi", // "Password123"
  firstName: "John",
  lastName: "Seller",
  phoneNumber: "+1234567890",
  roles: ["SELLER"],
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Insert the seller
db.users.insertOne(seller);

// Get the seller ID
const sellerId = db.users.findOne({username: "test_seller"})._id;

// Sample auction items
const auctionItems = [
  {
    title: "Vintage Rolex Submariner 16610",
    description: "Classic Rolex Submariner from 2000, excellent condition with original box and papers. Serviced in 2023. Perfect for collectors or daily wear.",
    category: "Watches",
    startingPrice: 8500.00,
    currentPrice: 8500.00,
    reservePrice: 12000.00,
    imageUrls: [
      "https://images.unsplash.com/photo-1523170335258-f5b6d6a8f7b3?w=500",
      "https://images.unsplash.com/photo-1523170335258-f5b6d6a8f7b3?w=500"
    ],
    status: "ACTIVE",
    startTime: new Date("2024-09-14T10:00:00Z"),
    endTime: new Date("2024-09-21T18:00:00Z"),
    createdAt: new Date("2024-09-14T09:30:00Z"),
    updatedAt: new Date("2024-09-14T09:30:00Z"),
    seller: sellerId
  },
  {
    title: "MacBook Pro 16-inch M3 Max",
    description: "Brand new MacBook Pro 16-inch with M3 Max chip, 32GB RAM, 1TB SSD. Still sealed in original packaging. Perfect for professionals and creators.",
    category: "Electronics",
    startingPrice: 3200.00,
    currentPrice: 3200.00,
    reservePrice: 4000.00,
    imageUrls: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"
    ],
    status: "ACTIVE",
    startTime: new Date("2024-09-14T11:00:00Z"),
    endTime: new Date("2024-09-18T20:00:00Z"),
    createdAt: new Date("2024-09-14T10:30:00Z"),
    updatedAt: new Date("2024-09-14T10:30:00Z"),
    seller: sellerId
  },
  {
    title: "Antique Persian Rug - 8x10",
    description: "Beautiful hand-woven Persian rug from the 1950s. Excellent condition with vibrant colors. Perfect centerpiece for any living room.",
    category: "Home & Garden",
    startingPrice: 1200.00,
    currentPrice: 1200.00,
    reservePrice: 2000.00,
    imageUrls: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"
    ],
    status: "ACTIVE",
    startTime: new Date("2024-09-14T12:00:00Z"),
    endTime: new Date("2024-09-20T15:00:00Z"),
    createdAt: new Date("2024-09-14T11:30:00Z"),
    updatedAt: new Date("2024-09-14T11:30:00Z"),
    seller: sellerId
  }
];

// Insert auction items
db.auction_items.insertMany(auctionItems);

// Create a sample bidder
const bidder = {
  username: "test_bidder",
  email: "bidder@example.com",
  password: "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi", // "Password123"
  firstName: "Jane",
  lastName: "Bidder",
  phoneNumber: "+1234567891",
  roles: ["BIDDER"],
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Insert the bidder
db.users.insertOne(bidder);

// Get the bidder ID
const bidderId = db.users.findOne({username: "test_bidder"})._id;

// Get auction items
const auctions = db.auction_items.find().toArray();

// Create some sample bids
const bids = [
  {
    auctionItem: auctions[0]._id,
    bidder: bidderId,
    amount: 9000.00,
    timestamp: new Date("2024-09-14T14:00:00Z"),
    status: "ACTIVE"
  },
  {
    auctionItem: auctions[1]._id,
    bidder: bidderId,
    amount: 3500.00,
    timestamp: new Date("2024-09-14T15:00:00Z"),
    status: "ACTIVE"
  }
];

// Insert bids
db.bids.insertMany(bids);

print("Sample data inserted successfully!");
print("Seller: " + sellerId);
print("Bidder: " + bidderId);
print("Auctions: " + auctions.length);
print("Bids: " + bids.length);