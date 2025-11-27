import { WebSocket } from 'ws';
class WebSocketService {
    clients;
    constructor() {
        this.clients = new Set();
    }
    addClient(ws) {
        this.clients.add(ws);
        console.log(`Client connected. Total clients: ${this.clients.size}`);
    }
    removeClient(ws) {
        this.clients.delete(ws);
        console.log(`Client disconnected. Total clients: ${this.clients.size}`);
    }
    broadcast(data) {
        const message = JSON.stringify(data);
        let sentCount = 0;
        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(message);
                    sentCount++;
                }
                catch (error) {
                    console.error('Error sending to client:', error);
                    this.clients.delete(client);
                }
            }
        });
        return sentCount;
    }
    sendToClient(ws, data) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }
    getClientCount() {
        return this.clients.size;
    }
}
export default new WebSocketService();
//# sourceMappingURL=websocket.service.js.map