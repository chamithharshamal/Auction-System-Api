import api from './api';
import type { 
  ApiResponse, 
  AuctionItem, 
  CreateAuctionRequest, 
  UpdateAuctionRequest, 
  PaginatedResponse
} from '../types/api';

export const auctionService = {
  // Get all auctions with pagination
  async getAllAuctions(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
    const response = await api.get<ApiResponse<PaginatedResponse<AuctionItem>>>(
      `/auctions?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
    return response.data.data;
  },

  // Get auction by ID
  async getAuctionById(id: string): Promise<AuctionItem> {
    const response = await api.get<ApiResponse<AuctionItem>>(`/auctions/${id}`);
    return response.data.data;
  },

  // Create new auction
  async createAuction(auctionData: CreateAuctionRequest): Promise<AuctionItem> {
    const response = await api.post<ApiResponse<AuctionItem>>('/auctions', auctionData);
    return response.data.data;
  },

  // Update auction
  async updateAuction(id: string, auctionData: UpdateAuctionRequest): Promise<AuctionItem> {
    const response = await api.put<ApiResponse<AuctionItem>>(`/auctions/${id}`, auctionData);
    return response.data.data;
  },

  // Delete auction
  async deleteAuction(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/auctions/${id}`);
  },

  // Get active auctions
  async getActiveAuctions(page = 0, size = 10) {
    const response = await api.get<ApiResponse<PaginatedResponse<AuctionItem>>>(
      `/auctions/active?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  // Get auctions ending soon
  async getAuctionsEndingSoon(): Promise<AuctionItem[]> {
    const response = await api.get<ApiResponse<AuctionItem[]>>('/auctions/ending-soon');
    return response.data.data;
  },

  // Get auctions by category
  async getAuctionsByCategory(category: string, page = 0, size = 10) {
    const response = await api.get<ApiResponse<PaginatedResponse<AuctionItem>>>(
      `/auctions/category/${category}?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  // Search auctions
  async searchAuctions(query: string): Promise<AuctionItem[]> {
    const response = await api.get<ApiResponse<AuctionItem[]>>(`/auctions/search?query=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  // Get auctions by price range
  async getAuctionsByPriceRange(minPrice: number, maxPrice: number, page = 0, size = 10) {
    const response = await api.get<ApiResponse<PaginatedResponse<AuctionItem>>>(
      `/auctions/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&size=${size}`
    );
    return response.data.data;
  },

  // Get top auctions by price
  async getTopAuctionsByPrice(limit = 10): Promise<AuctionItem[]> {
    const response = await api.get<ApiResponse<AuctionItem[]>>(`/auctions/top-by-price?limit=${limit}`);
    return response.data.data;
  },

  // Get recent auctions
  async getRecentAuctions(limit = 10): Promise<AuctionItem[]> {
    const response = await api.get<ApiResponse<AuctionItem[]>>(`/auctions/recent?limit=${limit}`);
    return response.data.data;
  },

  // Get auctions by seller
  async getAuctionsBySeller(sellerId: string, page = 0, size = 10) {
    const response = await api.get<ApiResponse<PaginatedResponse<AuctionItem>>>(
      `/auctions/seller/${sellerId}?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  // Start auction
  async startAuction(id: string): Promise<AuctionItem> {
    const response = await api.patch<ApiResponse<AuctionItem>>(`/auctions/${id}/start`);
    return response.data.data;
  },

  // End auction
  async endAuction(id: string): Promise<AuctionItem> {
    const response = await api.patch<ApiResponse<AuctionItem>>(`/auctions/${id}/end`);
    return response.data.data;
  },

  // Cancel auction
  async cancelAuction(id: string): Promise<AuctionItem> {
    const response = await api.patch<ApiResponse<AuctionItem>>(`/auctions/${id}/cancel`);
    return response.data.data;
  },

  // Get auction statistics
  async getSellerAuctionCount(sellerId: string): Promise<number> {
    const response = await api.get<ApiResponse<number>>(`/auctions/stats/seller/${sellerId}`);
    return response.data.data;
  },

  async getActiveAuctionsCount(): Promise<number> {
    const response = await api.get<ApiResponse<number>>('/auctions/stats/active-count');
    return response.data.data;
  },
};
