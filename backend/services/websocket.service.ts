import { WebSocket } from 'ws';

class WebSocketService {
    private clients: Set<WebSocket>;

    constructor() {
        this.clients = new Set<WebSocket>();
    }

    addClient(ws: WebSocket): void {
        this.clients.add(ws);
        console.log(`Client connected. Total clients: ${this.clients.size}`);
    }

    removeClient(ws: WebSocket): void {
        this.clients.delete(ws);
        console.log(`Client disconnected. Total clients: ${this.clients.size}`);
    }

    broadcast(data: any): number {
        const message = JSON.stringify(data);
        let sentCount = 0;
        
        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(message);
                    sentCount++;
                } catch (error) {
                    console.error('Error sending to client:', error);
                    this.clients.delete(client);
                }
            }
        });
        
        return sentCount;
    }

    sendToClient(ws: WebSocket, data: any): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    getClientCount(): number {
        return this.clients.size;
    }
}

export default new WebSocketService();
