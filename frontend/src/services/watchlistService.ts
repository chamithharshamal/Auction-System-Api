import axios from 'axios';
import type { AuctionItem } from '../types/api';

const API_URL = 'http://localhost:8080/api/watchlist';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

export const watchlistService = {
    addToWatchlist: async (auctionId: string) => {
        const response = await axios.post(`${API_URL}/${auctionId}`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    removeFromWatchlist: async (auctionId: string) => {
        const response = await axios.delete(`${API_URL}/${auctionId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getWatchlist: async (): Promise<AuctionItem[]> => {
        const response = await axios.get(API_URL, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    isWatched: async (auctionId: string): Promise<boolean> => {
        try {
            const response = await axios.get(`${API_URL}/check/${auctionId}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            return false;
        }
    }
};
