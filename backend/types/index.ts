// Database types
export interface TemperatureReading {
    id?: number;
    device_id: string;
    temperature: number;
    timestamp?: string;
}

export interface EnergyReading {
    id?: number;
    device_id: string;
    voltage: number | null;
    current: number | null;
    active_power: number | null;
    power_factor: number | null;
    frequency: number | null;
    energy_total: number | null;
    timestamp?: string;
}

// Modbus types
// ...existing code...

export interface ModbusEnergyData {
    slaveId: number;
    deviceId: string;
    meterId: number;
    voltage: number;
    current: number;
    active_power: number;
    apparent_power: number;
    reactive_power: number;
    power_factor: number;
    frequency: number;
    import_active_energy: number;
    export_active_energy: number;
    import_reactive_energy: number;
    export_reactive_energy: number;
    energy_total: number;
    timestamp: string;
    success: boolean;
    error?: string;
}

// ...existing code...

export interface ModbusConfig {
    port: string;
    baudRate: number;
    slaveIds: Record<number, number>;
}

// WebSocket message types
export interface WebSocketMessage {
    type: 'connection_status' | 'modbus_status' | 'energy_reading';
    connected?: boolean;
    modbusConnected?: boolean;
    message?: string;
    [key: string]: any;
}

// Config types
export interface AppConfig {
    port: number;
    modbus: {
        port: string;
        baudRate: number;
        slaveId: number;
        readingInterval: number;
    };
    database: {
        filename: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    cors: {
        origin: string;
        credentials: boolean;
    };
}

// User types
export interface User {
    id?: number;
    username: string;
    password: string;
    email?: string;
    created_at?: string;
}

export interface UserPayload {
    id: number;
    username: string;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    count?: number;
}

// Query parameters
export interface PaginationQuery {
    limit?: string;
    offset?: string;
}

export interface DateRangeQuery {
    startDate?: string;
    endDate?: string;
}
