import { WebSocket } from 'ws';
declare class WebSocketService {
    private clients;
    constructor();
    addClient(ws: WebSocket): void;
    removeClient(ws: WebSocket): void;
    broadcast(data: any): number;
    sendToClient(ws: WebSocket, data: any): void;
    getClientCount(): number;
}
declare const _default: WebSocketService;
export default _default;
//# sourceMappingURL=websocket.service.d.ts.map