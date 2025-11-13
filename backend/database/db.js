import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

async function migrateRemoveHumidity(database) {
    // Cek struktur tabel
    const cols = await database.all(`PRAGMA table_info(temperature_readings)`);
    const hasHumidity = cols.some(c => c.name === 'humidity');

    if (!hasHumidity) return;

    console.log('Migrating: removing humidity column from temperature_readings...');
    await database.exec('BEGIN TRANSACTION');
    try {
        await database.exec(`
            CREATE TABLE IF NOT EXISTS temperature_readings_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT NOT NULL,
                temperature REAL NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await database.exec(`
            INSERT INTO temperature_readings_new (id, device_id, temperature, timestamp)
            SELECT id, device_id, temperature, timestamp
            FROM temperature_readings
        `);

        await database.exec(`DROP TABLE temperature_readings`);
        await database.exec(`ALTER TABLE temperature_readings_new RENAME TO temperature_readings`);
        await database.exec(`CREATE INDEX IF NOT EXISTS idx_timestamp ON temperature_readings(timestamp DESC)`);
        await database.exec('COMMIT');
        console.log('Migration complete.');
    } catch (e) {
        await database.exec('ROLLBACK');
        console.error('Migration failed:', e);
        throw e;
    }
}

export async function initDatabase() {
    if (db) return db;

    db = await open({
        filename: path.join(__dirname, 'temperature.db'),
        driver: sqlite3.Database
    });

    // Tabel suhu (tanpa humidity)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS temperature_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id TEXT NOT NULL,
            temperature REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Migrasi jika DB lama masih punya kolom humidity
    await migrateRemoveHumidity(db);

    // Index suhu
    await db.exec(`
        CREATE INDEX IF NOT EXISTS idx_timestamp ON temperature_readings(timestamp DESC)
    `);

    // Tabel energi (TEM015XP: V, A, W, PF, Hz, kWh)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS energy_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id TEXT NOT NULL,
            voltage REAL NOT NULL,        -- V
            current REAL NOT NULL,        -- A
            active_power REAL NOT NULL,   -- W
            power_factor REAL NOT NULL,   -- PF (0..1)
            frequency REAL NOT NULL,      -- Hz
            energy_total REAL NOT NULL,   -- kWh (akumulatif)
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await db.exec(`
        CREATE INDEX IF NOT EXISTS idx_energy_timestamp ON energy_readings(timestamp DESC)
    `);

    console.log('Database initialized successfully');
    return db;
}

export async function getDatabase() {
    if (!db) {
        await initDatabase();
    }
    return db;
}

// Suhu
export async function saveReading(deviceId, temperature) {
    const database = await getDatabase();
    return await database.run(
        'INSERT INTO temperature_readings (device_id, temperature) VALUES (?, ?)',
        [deviceId, temperature]
    );
}

export async function getReadings(limit = 100, offset = 0) {
    const database = await getDatabase();
    return await database.all(
        'SELECT * FROM temperature_readings ORDER BY timestamp DESC LIMIT ? OFFSET ?',
        [limit, offset]
    );
}

export async function getReadingsByDateRange(startDate, endDate) {
    const database = await getDatabase();
    return await database.all(
        'SELECT * FROM temperature_readings WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
        [startDate, endDate]
    );
}

// Energi (TEM015XP)
export async function saveEnergyReading(deviceId, sample, timestamp = null) {
    const database = await getDatabase();
    const {
        voltage,
        current,
        active_power,
        power_factor,
        frequency,
        energy_total
    } = sample;

    if (timestamp) {
        return await database.run(
            `INSERT INTO energy_readings 
             (device_id, voltage, current, active_power, power_factor, frequency, energy_total, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [deviceId, voltage, current, active_power, power_factor, frequency, energy_total, timestamp]
        );
    }

    return await database.run(
        `INSERT INTO energy_readings 
         (device_id, voltage, current, active_power, power_factor, frequency, energy_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [deviceId, voltage, current, active_power, power_factor, frequency, energy_total]
    );
}

export async function getEnergyReadings(limit = 100, offset = 0) {
    const database = await getDatabase();
    return await database.all(
        'SELECT * FROM energy_readings ORDER BY timestamp DESC LIMIT ? OFFSET ?',
        [limit, offset]
    );
}

export async function getEnergyReadingsByDateRange(startDate, endDate) {
    const database = await getDatabase();
    return await database.all(
        'SELECT * FROM energy_readings WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
        [startDate, endDate]
    );
}