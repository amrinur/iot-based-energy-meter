import { useEffect, useState, useRef } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

export function useWebSocket() {
    const [data, setData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [modbusConnected, setModbusConnected] = useState(false);
    const [error, setError] = useState(null);
    const ws = useRef(null);
    const reconnectTimeout = useRef(null);
    const pingInterval = useRef(null);

    const connect = () => {
        try {
            ws.current = new WebSocket(WS_URL);

            ws.current.onopen = () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);
                setError(null);

                // Start ping to keep connection alive
                pingInterval.current = setInterval(() => {
                    if (ws.current?.readyState === 1) {
                        ws.current.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 30000); // 30 seconds
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    
                    // Handle different message types
                    if (message.type === 'connection_status') {
                        setModbusConnected(message.modbusConnected);
                    } else if (message.type === 'modbus_status') {
                        setModbusConnected(message.connected);
                    } else if (message.type === 'energy_reading') {
                        setModbusConnected(true); // If receiving data, modbus is connected
                        setData(message);
                    } else {
                        setData(message);
                    }
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err);
                }
            };

            ws.current.onerror = (err) => {
                console.error('❌ WebSocket error:', err);
                setError('WebSocket connection error');
            };

            ws.current.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                setIsConnected(false);
                setModbusConnected(false);
                
                if (pingInterval.current) {
                    clearInterval(pingInterval.current);
                }
                
                // Auto-reconnect after 5 seconds
                reconnectTimeout.current = setTimeout(() => {
                    console.log('🔄 Attempting to reconnect...');
                    connect();
                }, 5000);
            };
        } catch (err) {
            console.error('Failed to create WebSocket:', err);
            setError('Failed to connect to WebSocket');
            setIsConnected(false);
            setModbusConnected(false);
        }
    };

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            if (pingInterval.current) {
                clearInterval(pingInterval.current);
            }
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    return { data, isConnected, modbusConnected, error };
}