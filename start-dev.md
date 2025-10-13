# Development Setup

## Starting the Application

### Backend (Spring Boot)
1. Navigate to the root directory: `cd "F:\Projects\Java Projects\Auction\Auction-System-Api"`
2. Start the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will run on `http://localhost:8080`

### Frontend (React + Vite)
1. Navigate to the frontend directory: `cd frontend`
2. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## Prerequisites

- Java 17+
- Maven 3.6+
- Node.js 16+
- MongoDB running on localhost:27017

## Features Implemented

### Frontend Features
✅ Modern React + TypeScript + Vite setup
✅ Material UI with custom theme (60-30-10 color rule)
✅ Authentication system (Login/Register)
✅ Auction browsing and search
✅ Auction detail pages with bidding
✅ User profile management
✅ My Auctions page for sellers
✅ My Bids page for buyers
✅ Create auction functionality
✅ Responsive design
✅ API integration with backend

### Backend Features
✅ Spring Boot REST API
✅ JWT Authentication
✅ MongoDB integration
✅ User management
✅ Auction management
✅ Bidding system
✅ File upload support
✅ WebSocket notifications
✅ Comprehensive API endpoints

## Color Palette

- **Primary (60%)**: Deep Navy Blue (#1a365d)
- **Secondary (30%)**: Warm Charcoal Gray (#4a5568)  
- **Accent (10%)**: Gold/Amber (#d69e2e)

## API Endpoints

The frontend integrates with these main API endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auctions` - List auctions
- `GET /api/auctions/{id}` - Get auction details
- `POST /api/auctions` - Create auction
- `POST /api/bids/auction/{id}` - Place bid
- `GET /api/bids/auction/{id}` - Get auction bids

## Next Steps

1. Start both backend and frontend servers
2. Open `http://localhost:5173` in your browser
3. Register a new account or login
4. Browse auctions and start bidding!

