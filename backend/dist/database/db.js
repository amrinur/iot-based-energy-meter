import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'temperature.db');
let db = null;
export async function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            // Create temperature readings table (existing)
            db.run(`
                CREATE TABLE IF NOT EXISTS temperature_readings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    device_id TEXT NOT NULL,
                    temperature REAL NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating temperature_readings table:', err);
                    reject(err);
                    return;
                }
                // Create energy readings table (new)
                db.run(`
                    CREATE TABLE IF NOT EXISTS energy_readings (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        device_id TEXT NOT NULL,
                        voltage REAL,
                        current REAL,
                        active_power REAL,
                        power_factor REAL,
                        frequency REAL,
                        energy_total REAL,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating energy_readings table:', err);
                        reject(err);
                    }
                    else {
                        console.log('Database initialized successfully');
                        resolve();
                    }
                });
            });
        });
    });
}
export function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}
// ==================== TEMPERATURE FUNCTIONS (EXISTING) ====================
export function saveReading(deviceId, temperature) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO temperature_readings (device_id, temperature) VALUES (?, ?)';
        db.run(query, [deviceId, temperature], function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve({ id: this.lastID });
            }
        });
    });
}
export function getReadings(limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM temperature_readings 
            ORDER BY timestamp DESC 
            LIMIT ? OFFSET ?
        `;
        db.all(query, [limit, offset], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
export function getReadingsByDateRange(startDate, endDate) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM temperature_readings 
            WHERE timestamp BETWEEN ? AND ? 
            ORDER BY timestamp DESC
        `;
        db.all(query, [startDate, endDate], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
// ==================== ENERGY FUNCTIONS (NEW) ====================
export function saveEnergyReading(deviceId, data) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO energy_readings (
                device_id, voltage, current, active_power, 
                power_factor, frequency, energy_total
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(query, [
            deviceId,
            data.voltage,
            data.current,
            data.active_power,
            data.power_factor,
            data.frequency,
            data.energy_total
        ], function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve({ id: this.lastID });
            }
        });
    });
}
export function getEnergyReadings(limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM energy_readings 
            ORDER BY timestamp DESC 
            LIMIT ? OFFSET ?
        `;
        db.all(query, [limit, offset], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
export function getEnergyReadingsByDateRange(startDate, endDate) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM energy_readings 
            WHERE timestamp BETWEEN ? AND ? 
            ORDER BY timestamp DESC
        `;
        db.all(query, [startDate, endDate], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
export function getEnergyReadingsByDevice(deviceId, limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM energy_readings 
            WHERE device_id = ?
            ORDER BY timestamp DESC 
            LIMIT ? OFFSET ?
        `;
        db.all(query, [deviceId, limit, offset], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
export default {
    initDatabase,
    getDatabase,
    saveReading,
    getReadings,
    getReadingsByDateRange,
    saveEnergyReading,
    getEnergyReadings,
    getEnergyReadingsByDateRange,
    getEnergyReadingsByDevice
};
//# sourceMappingURL=db.js.map