import { initDatabase, saveEnergyReading, getEnergyReadings, getEnergyReadingsByDateRange } from './db.js';

// Helper waktu
const hoursAgoISO = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const minutesAgoISO = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

// Random helper
const rand = (min, max) => +(Math.random() * (max - min) + min).toFixed(3);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Generate 1 sample konsisten (V, A, W, PF, Hz, kWh)
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
        console.log('🌱 Starting database seeding (TEM015XP metrics)...');
        await initDatabase();

        const deviceId = 'TEM015XP';
        let count = 0;

        // Mulai dari baseline energi, misal sudah 123.45 kWh
        let energyKWh = 123.45;

        // 7 hari terakhir (tiap 1 jam)
        const hoursSpan = 7 * 24;
        for (let h = hoursSpan; h >= 1; h--) {
            const sample = generateElectricalSample(energyKWh, 1);
            energyKWh = sample.energy_total;

            const timestamp = hoursAgoISO(h);
            await saveEnergyReading(deviceId, sample, timestamp);
            count++;
        }

        // 1 jam terakhir (tiap 5 menit = 1/12 jam)
        for (let m = 60; m >= 0; m -= 5) {
            const sample = generateElectricalSample(energyKWh, 1 / 12);
            energyKWh = sample.energy_total;

            const timestamp = minutesAgoISO(m);
            await saveEnergyReading(deviceId, sample, timestamp);
            count++;
        }

        console.log(`✅ Successfully seeded ${count} energy readings`);

        await showStatistics();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
}

async function showStatistics() {
    try {
        const latest = await getEnergyReadings(10);

        console.log('\n📊 Energy Database Statistics:');
        console.log('─────────────────────────────────────');
        console.log(`Last ${latest.length} rows preview:`);

        latest.slice(0, 5).forEach((r, i) => {
            console.log(
                `  ${i + 1}. V:${r.voltage}V, I:${r.current}A, P:${r.active_power}W, PF:${r.power_factor}, ` +
                `F:${r.frequency}Hz, E:${r.energy_total}kWh, t:${r.timestamp}`
            );
        });

        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const last24h = await getEnergyReadingsByDateRange(since24h, new Date().toISOString());
        console.log(`\n📅 Last 24 hours: ${last24h.length} readings`);
    } catch (error) {
        console.error('Error showing statistics:', error);
    }
}

async function clearDatabase() {
    try {
        console.log('🗑️  Clearing energy_readings table...');
        const db = await initDatabase();
        await db.run('DELETE FROM energy_readings');
        console.log('✅ energy_readings cleared successfully');
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
        console.log('  node database/seed.js --seed           # Seed energy data dummy');
        console.log('  node database/seed.js --clear          # Clear energy data');
        console.log('  node database/seed.js --clear --seed   # Clear and seed energy data');
    }

    process.exit(0);
}

main();