# AuctionHub - Modern Auction System

AuctionHub is a high-performance, real-time auction platform built with a robust Spring Boot backend and a sleek, modern React frontend. It features live bidding through WebSockets, advanced search capabilities with Elasticsearch, and a personalized user experience with watchlists and analytics.

<img width="1012" height="877" alt="auction 1" src="https://github.com/user-attachments/assets/e7b3ffd0-1c73-4ec7-84bb-1fdbf4b3e913" />

## 🚀 Key Features

- **Real-time Bidding**: Instant bid updates and auction status changes powered by WebSockets.
- **Advanced Search**: High-speed filtering and searching using Elasticsearch.
- **Modern UI/UX**: Premium "Cyber Emerald" aesthetic with responsive design using Material UI.
- **User Personas**: Distinct workflows for Buyers and Sellers.
- **Personalized Experience**: Watchlists, bid history tracking, and seller analytics.
- **Secure Authentication**: JWT-based security with role-based access control.
- **File Management**: Integrated image upload system for auction items.

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.4 (Java 17)
- **Database**: MongoDB (NoSQL)
- **Search Engine**: Elasticsearch
- **Security**: Spring Security & JWT
- **Communication**: WebSockets (STOMP)
- **Email**: Spring Mail with Thymeleaf templates

### Frontend
- **Library**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Material UI (MUI) & Custom CSS
- **State Management**: React Context API
- **API Client**: Axios

## ⚙️ Getting Started

### Prerequisites
- JDK 17+
- Node.js 16+
- MongoDB & Elasticsearch instances

### Backend Setup
1. Clone the repository.
2. Navigate to the root directory.
3. Create a `.env` file based on `.env.example`.
4. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure
- `src/main/java`: Backend source code (Controllers, Services, Repositories).
- `frontend/src`: Frontend source code (Components, Pages, Services).
- `Dockerfile`: Containerization configuration for deployment.
- `.env.example`: Template for environment variables.

## 📝 License
This project is open-source and available under the MIT License.
