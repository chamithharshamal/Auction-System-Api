import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = 'http://localhost:8080/ws';

class WebSocketService {
    private client: Client;
    private connected: boolean = false;

    constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
            this.connected = true;
            console.log('Connected to WebSocket');
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };
    }

    public connect() {
        if (!this.client.active) {
            this.client.activate();
        }
    }

    public disconnect() {
        if (this.client.active) {
            this.client.deactivate();
            this.connected = false;
        }
    }

    public subscribeToAuction(auctionId: string, callback: (message: any) => void) {
        if (!this.client.active) {
            // If not active, try to activate and wait? 
            // For simplicity, we assume connect() is called at app start or page load
            this.connect();
        }

        // We need to wait for connection before subscribing
        // This is a simple implementation; a robust one would use a queue or promise
        const checkConnection = setInterval(() => {
            if (this.connected) {
                clearInterval(checkConnection);
                this.client.subscribe(`/topic/auction/${auctionId}`, (message: IMessage) => {
                    if (message.body) {
                        callback(JSON.parse(message.body));
                    }
                });
            }
        }, 100);
    }

    public subscribeToNotifications(_username: string, callback: (notification: any) => void) {
        if (!this.client.active) {
            this.connect();
        }

        const checkConnection = setInterval(() => {
            if (this.connected) {
                clearInterval(checkConnection);
                // For convertAndSendToUser, Stomp destination is /user/queue/notifications
                this.client.subscribe('/user/queue/notifications', (message: IMessage) => {
                    if (message.body) {
                        callback(JSON.parse(message.body));
                    }
                });
            }
        }, 100);
    }
}

export const webSocketService = new WebSocketService();
