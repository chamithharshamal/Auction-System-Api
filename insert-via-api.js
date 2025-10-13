// Node.js script to insert sample auction data via REST API
// Run with: node insert-via-api.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

// Sample auction data
const sampleAuctions = [
  {
    title: "Vintage Rolex Submariner 16610",
    description: "Classic Rolex Submariner from 2000, excellent condition with original box and papers. Serviced in 2023. Perfect for collectors or daily wear.",
    category: "Watches",
    startingPrice: 8500.00,
    reservePrice: 12000.00,
    imageUrls: [
      "https://images.unsplash.com/photo-1523170335258-f5b6d6a8f7b3?w=500",
      "https://images.unsplash.com/photo-1523170335258-f5b6d6a8f7b3?w=500"
    ],
    sellerId: "507f1f77bcf86cd799439011" // Replace with actual seller ID
  },
  {
    title: "MacBook Pro 16-inch M3 Max",
    description: "Brand new MacBook Pro 16-inch with M3 Max chip, 32GB RAM, 1TB SSD. Still sealed in original packaging. Perfect for professionals and creators.",
    category: "Electronics",
    startingPrice: 3200.00,
    reservePrice: 4000.00,
    imageUrls: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"
    ],
    sellerId: "507f1f77bcf86cd799439011"
  },
  {
    title: "Antique Persian Rug - 8x10",
    description: "Beautiful hand-woven Persian rug from the 1950s. Excellent condition with vibrant colors. Perfect centerpiece for any living room.",
    category: "Home & Garden",
    startingPrice: 1200.00,
    reservePrice: 2000.00,
    imageUrls: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"
    ],
    sellerId: "507f1f77bcf86cd799439011"
  },
  {
    title: "Vincent van Gogh Print - Starry Night",
    description: "High-quality museum reproduction of Van Gogh's Starry Night. Framed and ready to hang. Perfect for art lovers and collectors.",
    category: "Art & Collectibles",
    startingPrice: 150.00,
    reservePrice: 300.00,
    imageUrls: [
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500",
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500"
    ],
    sellerId: "507f1f77bcf86cd799439011"
  },
  {
    title: "Diamond Engagement Ring - 2ct",
    description: "Stunning 2-carat diamond engagement ring with platinum setting. GIA certified. Perfect for that special proposal moment.",
    category: "Jewelry",
    startingPrice: 15000.00,
    reservePrice: 25000.00,
    imageUrls: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500"
    ],
    sellerId: "507f1f77bcf86cd799439011"
  }
];

async function insertSampleData() {
  try {
    console.log('Starting to insert sample auction data...');
    
    for (const auction of sampleAuctions) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auctions`, auction, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        console.log(`✅ Created auction: ${auction.title}`);
      } catch (error) {
        console.error(`❌ Failed to create auction: ${auction.title}`);
        console.error(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('Sample data insertion completed!');
  } catch (error) {
    console.error('Error inserting sample data:', error.message);
  }
}

// Run the script
insertSampleData();
