import api from './api';
import type {
  ApiResponse,
  Bid,
  PlaceBidRequest,
  PaginatedResponse
} from '../types/api';

export const bidService = {
  // Place a bid
  async placeBid(auctionId: string, bidData: PlaceBidRequest): Promise<Bid> {
    const response = await api.post<ApiResponse<Bid>>(`/bids/auction/${auctionId}`, bidData);
    return response.data.data;
  },

  // Get bid by ID
  async getBidById(id: string): Promise<Bid> {
    const response = await api.get<ApiResponse<Bid>>(`/bids/${id}`);
    return response.data.data;
  },

  // Get all bids with pagination
  async getAllBids(page = 0, size = 10, sortBy = 'timestamp', sortDir = 'desc') {
    const response = await api.get<ApiResponse<PaginatedResponse<Bid>>>(
      `/bids?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
    return response.data.data;
  },

  // Get bids for auction
  async getBidsForAuction(auctionId: string, page = 0, size = 10) {
    const response = await api.get<ApiResponse<PaginatedResponse<Bid>>>(
      `/bids/auction/${auctionId}?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  // Get recent bids for auction
  async getRecentBidsForAuction(auctionId: string, limit = 5): Promise<Bid[]> {
    const response = await api.get<ApiResponse<Bid[]>>(`/bids/auction/${auctionId}/recent?limit=${limit}`);
    return response.data.data;
  },

  // Get price trends for auction
  async getPriceTrends(auctionId: string): Promise<{ amount: number, timestamp: string, bidderName: string }[]> {
    const response = await api.get<ApiResponse<{ amount: number, timestamp: string, bidderName: string }[]>>(`/bids/auction/${auctionId}/trends`);
    return response.data.data;
  },

  // Get highest bid for auction
  async getHighestBidForAuction(auctionId: string): Promise<Bid> {
    const response = await api.get<ApiResponse<Bid>>(`/bids/auction/${auctionId}/highest`);
    return response.data.data;
  },

  // Get bids by bidder
  async getBidsByBidder(bidderId: string, page = 0, size = 10) {
    const response = await api.get<ApiResponse<PaginatedResponse<Bid>>>(
      `/bids/bidder/${bidderId}?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  // Get recent bids by bidder
  async getRecentBidsByBidder(bidderId: string, limit = 10): Promise<Bid[]> {
    const response = await api.get<ApiResponse<Bid[]>>(`/bids/bidder/${bidderId}/recent?limit=${limit}`);
    return response.data.data;
  },

  // Get winning bids for user
  async getWinningBidsForUser(bidderId: string): Promise<Bid[]> {
    const response = await api.get<ApiResponse<Bid[]>>(`/bids/bidder/${bidderId}/winning`);
    return response.data.data;
  },

  // Get bids by status
  async getBidsByStatus(status: string): Promise<Bid[]> {
    const response = await api.get<ApiResponse<Bid[]>>(`/bids/status/${status}`);
    return response.data.data;
  },

  // Get bids in date range
  async getBidsInDateRange(startDate: string, endDate: string): Promise<Bid[]> {
    const response = await api.get<ApiResponse<Bid[]>>(
      `/bids/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data.data;
  },

  // Get bids in amount range
  async getBidsInAmountRange(minAmount: number, maxAmount: number): Promise<Bid[]> {
    const response = await api.get<ApiResponse<Bid[]>>(
      `/bids/amount-range?minAmount=${minAmount}&maxAmount=${maxAmount}`
    );
    return response.data.data;
  },

  // Cancel bid
  async cancelBid(id: string): Promise<Bid> {
    const response = await api.patch<ApiResponse<Bid>>(`/bids/${id}/cancel`);
    return response.data.data;
  },

  // Check if user has bid on auction
  async hasUserBidOnAuction(bidderId: string, auctionId: string): Promise<boolean> {
    const response = await api.get<ApiResponse<boolean>>(`/bids/check/${bidderId}/auction/${auctionId}`);
    return response.data.data;
  },

  // Get bid count for auction
  async getBidCountForAuction(auctionId: string): Promise<number> {
    const response = await api.get<ApiResponse<number>>(`/bids/count/auction/${auctionId}`);
    return response.data.data;
  },

  // Get bid count for user
  async getBidCountForUser(bidderId: string): Promise<number> {
    const response = await api.get<ApiResponse<number>>(`/bids/count/bidder/${bidderId}`);
    return response.data.data;
  },

  // Get all active bids
  async getActiveBids(): Promise<Bid[]> {
    const response = await api.get<ApiResponse<Bid[]>>('/bids/active');
    return response.data.data;
  },
};
