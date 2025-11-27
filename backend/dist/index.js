import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import deviceRouter from './routes/device.route.js';
import { initDatabase, saveEnergyReading } from './database/db.js';
import ModbusReader from './modbus/modbusReader.js';
dotenv.config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
// Routes
app.use('/api/devices', deviceRouter);
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        modbus: modbusReader.isConnected,
        clients: clients.size,
        timestamp: new Date().toISOString()
    });
});
// WebSocket connections
const clients = new Set();
wss.on('connection', (ws) => {
    console.log('✅ Client connected to WebSocket');
    clients.add(ws);
    ws.send(JSON.stringify({
        type: 'connection_status',
        connected: true,
        modbusConnected: modbusReader.isConnected
    }));
    ws.on('close', () => {
        console.log('🔌 Client disconnected from WebSocket');
        clients.delete(ws);
    });
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        clients.delete(ws);
    });
});
// Broadcast data to all connected clients
function broadcastData(data) {
    const message = JSON.stringify(data);
    let sentCount = 0;
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(message);
                sentCount++;
            }
            catch (error) {
                console.error('Error sending to client:', error);
                clients.delete(client);
            }
        }
    });
    return sentCount;
}
// Initialize Modbus Reader
const modbusReader = new ModbusReader();
let readingInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
async function startModbusReading() {
    const connected = await modbusReader.connect();
    if (!connected) {
        reconnectAttempts++;
        broadcastData({
            type: 'modbus_status',
            connected: false,
            message: `Modbus disconnected. Retry attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`
        });
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            console.log(`⏳ Failed to connect to Modbus. Retrying in 10 seconds... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
            setTimeout(startModbusReading, 10000);
        }
        else {
            console.log('❌ Max reconnection attempts reached. Modbus disabled.');
            console.log('✅ Server continues running without Modbus (API/WebSocket still work)');
        }
        return;
    }
    reconnectAttempts = 0;
    broadcastData({
        type: 'modbus_status',
        connected: true,
        message: 'Modbus connected successfully'
    });
    const intervalTime = parseInt(process.env.READING_INTERVAL || '5000', 10);
    // Polling loop - baca 2 device bergantian
    readingInterval = setInterval(async () => {
        try {
            // Baca semua device (meter 1 dan 2)
            const allData = await modbusReader.readAllDevices();
            for (const data of allData) {
                if (data.success) {
                    // Save to database
                    await saveEnergyReading(data.deviceId, {
                        voltage: data.voltage,
                        current: data.current,
                        active_power: data.active_power,
                        power_factor: data.power_factor,
                        frequency: data.frequency,
                        energy_total: data.energy_total
                    });
                    // Broadcast to WebSocket clients
                    const sentCount = broadcastData({
                        type: 'energy_reading',
                        ...data
                    });
                    console.log(`📊 [Meter ${data.meterId}] V:${data.voltage}V I:${data.current}A P:${data.active_power}W | Sent to ${sentCount} clients`);
                }
                else {
                    console.log(`⚠️ [Meter ${data.meterId}] Failed to read: ${data.error}`);
                }
            }
            // Cek koneksi
            if (!modbusReader.isConnected) {
                if (readingInterval)
                    clearInterval(readingInterval);
                console.log('🔄 Connection lost. Attempting to reconnect...');
                startModbusReading();
            }
        }
        catch (error) {
            console.error('❌ Error in reading interval:', error);
        }
    }, intervalTime);
    console.log(`🔄 Modbus reading started for 2 devices (every ${intervalTime}ms)`);
}
// Initialize and start server
async function startServer() {
    try {
        await initDatabase();
        console.log('✅ Database ready');
        const PORT = parseInt(process.env.PORT || '3000', 10);
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 WebSocket server ready on ws://localhost:${PORT}`);
            console.log(`🌐 API available at http://localhost:${PORT}/api`);
            console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
        });
        console.log('🔌 Attempting to connect to Modbus...');
        startModbusReading();
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down gracefully...');
    if (readingInterval)
        clearInterval(readingInterval);
    await modbusReader.disconnect();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
process.on('SIGTERM', async () => {
    console.log('\n⏹️  SIGTERM received. Shutting down...');
    if (readingInterval)
        clearInterval(readingInterval);
    await modbusReader.disconnect();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
startServer();
//# sourceMappingURL=index.js.map