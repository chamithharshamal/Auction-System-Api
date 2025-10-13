# AuctionHub Frontend

A modern React frontend for the Auction System API, built with Vite, TypeScript, and Material UI.

## Features

- **Modern UI Design**: Clean, responsive design following the 60-30-10 color rule
- **Authentication**: User registration, login, and profile management
- **Auction Management**: Create, browse, and manage auctions
- **Bidding System**: Real-time bidding with bid history
- **User Dashboard**: Personal auction and bid management
- **Search & Filtering**: Advanced search and filtering capabilities
- **Responsive Design**: Mobile-first approach with Material UI

## Color Palette

The application follows a carefully designed color scheme:

- **Primary (60%)**: Deep Navy Blue (#1a365d) - Main brand color
- **Secondary (30%)**: Warm Charcoal Gray (#4a5568) - Supporting elements
- **Accent (10%)**: Gold/Amber (#d69e2e) - Highlights and CTAs

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Material UI (MUI)** for component library
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running on port 8080

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (LoadingSpinner, ErrorAlert)
│   └── layout/         # Layout components (Navbar)
├── contexts/           # React contexts (AuthContext)
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── auctions/       # Auction-related pages
│   └── user/           # User profile pages
├── services/           # API service functions
├── theme/              # Material UI theme configuration
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

## API Integration

The frontend integrates with the Spring Boot backend API:

- **Base URL**: `http://localhost:8080/api`
- **Authentication**: JWT token-based
- **Endpoints**: Full CRUD operations for auctions, bids, and users

## Key Features

### Authentication
- User registration with role selection (Buyer/Seller)
- Secure login with JWT tokens
- Protected routes based on user roles
- Automatic token refresh and logout

### Auction Management
- Browse auctions with search and filtering
- Create new auctions with image support
- Real-time auction details and bidding
- Auction status management

### Bidding System
- Place bids on active auctions
- View bid history and status
- Track winning bids
- Real-time bid updates

### User Experience
- Responsive design for all devices
- Intuitive navigation and user flows
- Error handling and loading states
- Modern Material Design components

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project follows:
- TypeScript strict mode
- ESLint configuration
- Material UI design system
- React best practices

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Follow Material UI design patterns
4. Write meaningful commit messages
5. Test your changes thoroughly

## License

This project is part of the Auction System API project.