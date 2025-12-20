import api from './api';
import type { ApiResponse } from '../types/api';

export interface DailySales {
    date: string;
    amount: number;
    count: number;
}

export interface SellerAnalytics {
    totalEarnings: number;
    totalAuctions: number;
    activeListings: number;
    soldItems: number;
    successRate: number;
    totalBidsReceived: number;
    salesHistory: DailySales[];
    categoryDistribution: Record<string, number>;
}

const analyticsService = {
    getSellerAnalytics: async (): Promise<SellerAnalytics> => {
        const response = await api.get<ApiResponse<SellerAnalytics>>('/analytics/seller');
        return response.data.data;
    }
};

export default analyticsService;
