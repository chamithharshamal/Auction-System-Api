// Base API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: UserRole[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  BIDDER = 'BIDDER',
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: UserRole[];
}

export interface JwtResponse {
  token: string;
  type: string;
  username: string;
  roles: UserRole[];
}

// Auction related types
export interface AuctionItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrls: string[];
  startingPrice: number;
  currentPrice: number;
  reservePrice: number;
  startDate: string;
  endDate: string;
  seller: User;
  highestBidder?: User;
  status: AuctionStatus;
  totalBids: number;
  createdAt: string;
  updatedAt: string;
}

export enum AuctionStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

export interface CreateAuctionRequest {
  title: string;
  description: string;
  category: string;
  imageUrls: string[];
  startingPrice: number;
  reservePrice: number;
  startDate: string;
  endDate: string;
  sellerId: string;
}

export interface UpdateAuctionRequest {
  title: string;
  description: string;
  category: string;
  imageUrls: string[];
  reservePrice: number;
  startDate: string;
  endDate: string;
}

// Bid related types
export interface Bid {
  id: string;
  amount: number;
  timestamp: string;
  bidder: User;
  auctionItemId: string;
  auctionItemTitle: string;
  status: BidStatus;
  notes?: string;
}

export enum BidStatus {
  ACTIVE = 'ACTIVE',
  OUTBID = 'OUTBID',
  WINNING = 'WINNING',
  CANCELLED = 'CANCELLED',
}

export interface PlaceBidRequest {
  bidderId: string;
  amount: number;
}

// Pagination types
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  empty: boolean;
}

// Search and filter types
export interface SearchAuctionRequest {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: AuctionStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// WebSocket notification types
export interface BidNotification {
  auctionId: string;
  auctionTitle: string;
  bidAmount: number;
  bidderName: string;
  timestamp: string;
  type: 'NEW_BID' | 'BID_OUTBID' | 'AUCTION_ENDING' | 'AUCTION_ENDED';
}

// File upload types
export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}
