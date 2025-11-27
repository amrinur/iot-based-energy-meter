import sqlite3 from 'sqlite3';
import { TemperatureReading, EnergyReading } from '../types/index.js';
export declare function initDatabase(): Promise<void>;
export declare function getDatabase(): sqlite3.Database;
export declare function saveReading(deviceId: string, temperature: number): Promise<{
    id: number;
}>;
export declare function getReadings(limit?: number, offset?: number): Promise<TemperatureReading[]>;
export declare function getReadingsByDateRange(startDate: string, endDate: string): Promise<TemperatureReading[]>;
export declare function saveEnergyReading(deviceId: string, data: Omit<EnergyReading, 'id' | 'device_id' | 'timestamp'>): Promise<{
    id: number;
}>;
export declare function getEnergyReadings(limit?: number, offset?: number): Promise<EnergyReading[]>;
export declare function getEnergyReadingsByDateRange(startDate: string, endDate: string): Promise<EnergyReading[]>;
export declare function getEnergyReadingsByDevice(deviceId: string, limit?: number, offset?: number): Promise<EnergyReading[]>;
declare const _default: {
    initDatabase: typeof initDatabase;
    getDatabase: typeof getDatabase;
    saveReading: typeof saveReading;
    getReadings: typeof getReadings;
    getReadingsByDateRange: typeof getReadingsByDateRange;
    saveEnergyReading: typeof saveEnergyReading;
    getEnergyReadings: typeof getEnergyReadings;
    getEnergyReadingsByDateRange: typeof getEnergyReadingsByDateRange;
    getEnergyReadingsByDevice: typeof getEnergyReadingsByDevice;
};
export default _default;
//# sourceMappingURL=db.d.ts.map