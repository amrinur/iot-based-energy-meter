import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    
    modbus: {
        port: process.env.MODBUS_PORT || 'COM3',
        baudRate: parseInt(process.env.MODBUS_BAUDRATE) || 9600,
        slaveId: parseInt(process.env.MODBUS_SLAVE_ID) || 1,
        readingInterval: parseInt(process.env.READING_INTERVAL) || 5000
    },
    
    database: {
        filename: process.env.DB_PATH || './database/temperature.db'
    },
    
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true
    }
};