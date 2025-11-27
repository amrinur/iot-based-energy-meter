import express from "express";
import { 
    saveDeviceReading, 
    getDeviceReadings, 
    getDeviceReadingsByDateRange,
    saveEnergyReadingController,
    getEnergyReadingsController,
    getEnergyReadingsByDateRangeController,
    getLatestEnergyReading
} from '../controllers/device.controller.js';

const router = express.Router();

// Temperature routes
router.post("/readings", saveDeviceReading);
router.get("/readings", getDeviceReadings);
router.get("/readings/range", getDeviceReadingsByDateRange);

// Energy routes (TEM015XP)
router.post("/energy", saveEnergyReadingController);
router.get("/energy", getEnergyReadingsController);
router.get("/energy/range", getEnergyReadingsByDateRangeController);
router.get("/energy/latest", getLatestEnergyReading);

export default router;
