import { saveReading, getReadings, getReadingsByDateRange } from '../database/db.js';

class DeviceService {
    async saveReading(deviceId, temperature, humidity) {
        try {
            const result = await saveReading(deviceId, temperature, humidity);
            return { success: true, id: result.lastID };
        } catch (error) {
            console.error('Error in DeviceService.saveReading:', error);
            throw error;
        }
    }

    async getReadings(limit = 100, offset = 0) {
        try {
            const readings = await getReadings(limit, offset);
            return readings;
        } catch (error) {
            console.error('Error in DeviceService.getReadings:', error);
            throw error;
        }
    }

    async getReadingsByDateRange(startDate, endDate) {
        try {
            const readings = await getReadingsByDateRange(startDate, endDate);
            return readings;
        } catch (error) {
            console.error('Error in DeviceService.getReadingsByDateRange:', error);
            throw error;
        }
    }

    async getLatestReading() {
        try {
            const readings = await getReadings(1, 0);
            return readings[0] || null;
        } catch (error) {
            console.error('Error in DeviceService.getLatestReading:', error);
            throw error;
        }
    }

    async getStatistics(startDate, endDate) {
        try {
            const readings = await getReadingsByDateRange(startDate, endDate);
            
            if (readings.length === 0) {
                return null;
            }

            const temperatures = readings.map(r => r.temperature);
            const avg = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
            const max = Math.max(...temperatures);
            const min = Math.min(...temperatures);

            return {
                count: readings.length,
                average: parseFloat(avg.toFixed(2)),
                max,
                min,
                startDate,
                endDate
            };
        } catch (error) {
            console.error('Error in DeviceService.getStatistics:', error);
            throw error;
        }
    }
}

export default new DeviceService();