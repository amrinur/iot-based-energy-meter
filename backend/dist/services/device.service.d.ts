import { TemperatureReading } from '../types/index.js';
interface ReadingResult {
    success: boolean;
    id?: number;
}
interface Statistics {
    count: number;
    average: number;
    max: number;
    min: number;
    startDate: string;
    endDate: string;
}
declare class DeviceService {
    saveReading(deviceId: string, temperature: number): Promise<ReadingResult>;
    getReadings(limit?: number, offset?: number): Promise<TemperatureReading[]>;
    getReadingsByDateRange(startDate: string, endDate: string): Promise<TemperatureReading[]>;
    getLatestReading(): Promise<TemperatureReading | null>;
    getStatistics(startDate: string, endDate: string): Promise<Statistics | null>;
}
declare const _default: DeviceService;
export default _default;
//# sourceMappingURL=device.service.d.ts.map