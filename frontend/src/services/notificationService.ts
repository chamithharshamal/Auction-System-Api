import api from './api';

export enum NotificationType {
    AUCTION_WON = 'AUCTION_WON',
    PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
    OUTBID = 'OUTBID',
    AUCTION_ENDED = 'AUCTION_ENDED'
}

export interface Notification {
    id: string;
    recipientId: string;
    message: string;
    type: NotificationType;
    read: boolean;
    createdAt: string;
    relatedEntityId: string;
}

const notificationService = {
    getNotifications: async (): Promise<Notification[]> => {
        const response = await api.get('/notifications');
        return response.data;
    },

    getUnreadNotifications: async (): Promise<Notification[]> => {
        const response = await api.get('/notifications/unread');
        return response.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await api.get('/notifications/unread-count');
        return response.data.count;
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.put(`/notifications/${id}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await api.put('/notifications/read-all');
    }
};

export default notificationService;
