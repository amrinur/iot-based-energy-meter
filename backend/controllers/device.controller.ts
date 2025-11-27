import { Request, Response } from 'express';
import { 
    saveReading, 
    getReadings, 
    getReadingsByDateRange,
    saveEnergyReading,
    getEnergyReadings,
    getEnergyReadingsByDateRange
} from '../database/db.js';
import { PaginationQuery, DateRangeQuery, ApiResponse, TemperatureReading, EnergyReading } from '../types/index.js';

// Temperature controllers (existing)
export const saveDeviceReading = async (req: Request, res: Response): Promise<void> => {
    try {
        const { deviceId, temperature } = req.body;
        
        if (!deviceId || temperature === undefined) {
            res.status(400).json({ error: 'Device ID and temperature are required' });
            return;
        }

        await saveReading(deviceId, temperature);
        
        res.status(201).json({
            success: true,
            message: 'Reading saved successfully'
        } as ApiResponse);
    } catch (error) {
        console.error('Error saving reading:', error);
        res.status(500).json({ error: 'Failed to save reading' });
    }
};

export const getDeviceReadings = async (req: Request<{}, {}, {}, PaginationQuery>, res: Response): Promise<void> => {
    try {
        const limit = parseInt(req.query.limit || '100', 10);
        const offset = parseInt(req.query.offset || '0', 10);

        const readings = await getReadings(limit, offset);
        
        res.json({
            success: true,
            data: readings,
            count: readings.length
        } as ApiResponse<TemperatureReading[]>);
    } catch (error) {
        console.error('Error fetching readings:', error);
        res.status(500).json({ error: 'Failed to fetch readings' });
    }
};

export const getDeviceReadingsByDateRange = async (req: Request<{}, {}, {}, DateRangeQuery>, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            res.status(400).json({ error: 'Start date and end date are required' });
            return;
        }

        const readings = await getReadingsByDateRange(startDate, endDate);
        
        res.json({
            success: true,
            data: readings,
            count: readings.length
        } as ApiResponse<TemperatureReading[]>);
    } catch (error) {
        console.error('Error fetching readings:', error);
        res.status(500).json({ error: 'Failed to fetch readings' });
    }
};

// Energy controllers (NEW)
export const saveEnergyReadingController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { deviceId, voltage, current, active_power, power_factor, frequency, energy_total } = req.body;
        
        if (!deviceId || voltage === undefined) {
            res.status(400).json({ error: 'Device ID and energy data are required' });
            return;
        }

        await saveEnergyReading(deviceId, {
            voltage,
            current,
            active_power,
            power_factor,
            frequency,
            energy_total
        });
        
        res.status(201).json({
            success: true,
            message: 'Energy reading saved successfully'
        } as ApiResponse);
    } catch (error) {
        console.error('Error saving energy reading:', error);
        res.status(500).json({ error: 'Failed to save energy reading' });
    }
};

export const getEnergyReadingsController = async (req: Request<{}, {}, {}, PaginationQuery>, res: Response): Promise<void> => {
    try {
        const limit = parseInt(req.query.limit || '100', 10);
        const offset = parseInt(req.query.offset || '0', 10);

        const readings = await getEnergyReadings(limit, offset);
        
        res.json({
            success: true,
            data: readings,
            count: readings.length
        } as ApiResponse<EnergyReading[]>);
    } catch (error) {
        console.error('Error fetching energy readings:', error);
        res.status(500).json({ error: 'Failed to fetch energy readings' });
    }
};

export const getEnergyReadingsByDateRangeController = async (req: Request<{}, {}, {}, DateRangeQuery>, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            res.status(400).json({ error: 'Start date and end date are required' });
            return;
        }

        const readings = await getEnergyReadingsByDateRange(startDate, endDate);
        
        res.json({
            success: true,
            data: readings,
            count: readings.length
        } as ApiResponse<EnergyReading[]>);
    } catch (error) {
        console.error('Error fetching energy readings:', error);
        res.status(500).json({ error: 'Failed to fetch energy readings' });
    }
};

export const getLatestEnergyReading = async (_req: Request, res: Response): Promise<void> => {
    try {
        const readings = await getEnergyReadings(1, 0);
        
        res.json({
            success: true,
            data: readings[0] || null
        } as ApiResponse<EnergyReading | null>);
    } catch (error) {
        console.error('Error fetching latest energy reading:', error);
        res.status(500).json({ error: 'Failed to fetch latest energy reading' });
    }
};
