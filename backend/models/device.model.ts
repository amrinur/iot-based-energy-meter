import { TemperatureReading } from '../types/index.js';

export class DeviceModel {
    static validateReading(reading: Partial<TemperatureReading>): boolean {
        return !!(reading.device_id && typeof reading.temperature === 'number');
    }
}
