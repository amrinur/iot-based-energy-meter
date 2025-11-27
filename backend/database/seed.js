import { 
    initDatabase, 
    saveReading,
    saveEnergyReading, 
    getReadings,
    getEnergyReadings, 
    getReadingsByDateRange,
    getEnergyReadingsByDateRange,
    getAllDeviceIds
} from './db.js';

// Helper waktu
const hoursAgoISO = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const minutesAgoISO = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

// Random helper
const rand = (min, max) => +(Math.random() * (max - min) + min).toFixed(3);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Generate temperature sample (15-35°C)
function generateTemperatureSample() {
    return +rand(15, 35).toFixed(2);
}

// Generate electrical sample konsisten (V, A, W, PF, Hz, kWh)
function generateElectricalSample(prevEnergyKWh = 0, intervalHours = 1) {
    // Tegangan 220–240V
    const voltage = rand(220, 240);

    // Faktor daya 0.85–1.00
    const power_factor = +rand(0.85, 1.0).toFixed(3);

    // Daya aktif 50–3000 W (beban rumah tangga umum)
    const active_power = +rand(50, 3000).toFixed(1);

    // Arus I = P / (V * PF)
    let current = active_power / (voltage * power_factor);
    current = +clamp(current, 0.1, 20).toFixed(3); // clamp ke 0.1–20A

    // Frekuensi 49.8–50.2 Hz
    const frequency = +rand(49.8, 50.2).toFixed(2);

    // Energi total akumulatif (kWh) = prev + (P(W)/1000)*jam
    const deltaKWh = (active_power / 1000) * intervalHours;
    const energy_total = +(prevEnergyKWh + deltaKWh).toFixed(4);

    return { voltage, current, active_power, power_factor, frequency, energy_total };
}

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding (Multi-Device: Thera + TEM015XP)...');
        await initDatabase();

        // Device IDs
        const theraDevices = ['THERA-001', 'THERA-002', 'THERA-003'];
        const energyDevices = ['TEM015XP-001', 'TEM015XP-002'];

        let tempCount = 0;
        let energyCount = 0;

        // ==================== SEED TEMPERATURE DATA ====================
        console.log('\n📊 Seeding temperature data...');
        
        for (const deviceId of theraDevices) {
            console.log(`  └─ Device: ${deviceId}`);
            
            // 7 hari terakhir (tiap 1 jam)
            const hoursSpan = 7 * 24;
            for (let h = hoursSpan; h >= 1; h--) {
                const temperature = generateTemperatureSample();
                const timestamp = hoursAgoISO(h);
                await saveReading(deviceId, temperature, timestamp);
                tempCount++;
            }

            // 1 jam terakhir (tiap 5 menit)
            for (let m = 60; m >= 0; m -= 5) {
                const temperature = generateTemperatureSample();
                const timestamp = minutesAgoISO(m);
                await saveReading(deviceId, temperature, timestamp);
                tempCount++;
            }
        }

        console.log(`✅ Temperature readings seeded: ${tempCount}`);

        // ==================== SEED ENERGY DATA ====================
        console.log('\n⚡ Seeding energy data...');

        for (const deviceId of energyDevices) {
            console.log(`  └─ Device: ${deviceId}`);
            
            // Mulai dari baseline energi berbeda per device
            let energyKWh = deviceId === 'TEM015XP-001' ? 123.45 : 456.78;

            // 7 hari terakhir (tiap 1 jam)
            const hoursSpan = 7 * 24;
            for (let h = hoursSpan; h >= 1; h--) {
                const sample = generateElectricalSample(energyKWh, 1);
                energyKWh = sample.energy_total;

                const timestamp = hoursAgoISO(h);
                await saveEnergyReading(deviceId, sample, timestamp);
                energyCount++;
            }

            // 1 jam terakhir (tiap 5 menit = 1/12 jam)
            for (let m = 60; m >= 0; m -= 5) {
                const sample = generateElectricalSample(energyKWh, 1 / 12);
                energyKWh = sample.energy_total;

                const timestamp = minutesAgoISO(m);
                await saveEnergyReading(deviceId, sample, timestamp);
                energyCount++;
            }
        }

        console.log(`✅ Energy readings seeded: ${energyCount}`);
        console.log(`\n📦 Total seeded: ${tempCount + energyCount} readings`);

        await showStatistics();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
}

async function showStatistics() {
    try {
        console.log('\n' + '='.repeat(60));
        console.log('📊 DATABASE STATISTICS');
        console.log('='.repeat(60));

        // Devices
        const devices = await getAllDeviceIds();
        console.log(`\n🔧 Total Devices: ${devices.length}`);
        devices.forEach(d => console.log(`   • ${d}`));

        // Temperature
        const latestTemp = await getReadings(5);
        console.log(`\n🌡️  Temperature Readings (Latest 5):`);
        console.log('─'.repeat(60));
        latestTemp.forEach((r, i) => {
            console.log(
                `  ${i + 1}. [${r.device_id}] ${r.temperature}°C @ ${r.timestamp}`
            );
        });

        const since24hTemp = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const last24hTemp = await getReadingsByDateRange(since24hTemp, new Date().toISOString());
        console.log(`\n📅 Last 24h Temperature: ${last24hTemp.length} readings`);

        // Energy
        const latestEnergy = await getEnergyReadings(5);
        console.log(`\n⚡ Energy Readings (Latest 5):`);
        console.log('─'.repeat(60));
        latestEnergy.forEach((r, i) => {
            console.log(
                `  ${i + 1}. [${r.device_id}] ${r.voltage}V, ${r.current}A, ${r.active_power}W, ` +
                `PF:${r.power_factor}, ${r.frequency}Hz, ${r.energy_total}kWh\n      @ ${r.timestamp}`
            );
        });

        const since24hEnergy = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const last24hEnergy = await getEnergyReadingsByDateRange(since24hEnergy, new Date().toISOString());
        console.log(`\n📅 Last 24h Energy: ${last24hEnergy.length} readings`);

        console.log('\n' + '='.repeat(60));
    } catch (error) {
        console.error('Error showing statistics:', error);
    }
}

async function clearDatabase() {
    try {
        console.log('🗑️  Clearing all tables...');
        const db = await initDatabase();
        
        await db.run('DELETE FROM temperature_readings');
        console.log('  ✅ temperature_readings cleared');
        
        await db.run('DELETE FROM energy_readings');
        console.log('  ✅ energy_readings cleared');
        
        console.log('\n✅ All data cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing database:', error);
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--clear')) {
        await clearDatabase();
    }

    if (args.includes('--seed')) {
        await seedDatabase();
    }

    if (args.length === 0) {
        console.log('Usage:');
        console.log('  node database/seed.js --seed           # Seed multi-device dummy data');
        console.log('  node database/seed.js --clear          # Clear all data');
        console.log('  node database/seed.js --clear --seed   # Clear and seed all data');
        console.log('  node database/seed.js --stats          # Show statistics only');
    }

    if (args.includes('--stats')) {
        await showStatistics();
    }

    process.exit(0);
}

main();