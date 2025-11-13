import { 
    initDatabase, 
    saveReading, 
    getReadings, 
    getReadingsByDateRange,
    getDatabase 
} from './db.js';

async function testDatabase() {
    console.log('🧪 Testing Database Functions...\n');
    
    try {
        // Test 1: Initialize Database
        console.log('Test 1: Initialize Database');
        await initDatabase();
        console.log('✅ Database initialized\n');

        // Test 2: Save Reading
        console.log('Test 2: Save Reading');
        const result = await saveReading('TEMO15XP', 25.5, 60.2);
        console.log('✅ Reading saved with ID:', result.lastID, '\n');

        // Test 3: Get Latest Readings
        console.log('Test 3: Get Latest 5 Readings');
        const latest = await getReadings(5, 0);
        console.log(`Found ${latest.length} readings:`);
        latest.forEach((reading, index) => {
            console.log(`  ${index + 1}. ID: ${reading.id}, Temp: ${reading.temperature}°C, Humidity: ${reading.humidity}%, Time: ${reading.timestamp}`);
        });
        console.log('');

        // Test 4: Get Readings by Date Range
        console.log('Test 4: Get Readings by Date Range (Last 7 days)');
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const now = new Date();
        
        const rangeReadings = await getReadingsByDateRange(
            sevenDaysAgo.toISOString(),
            now.toISOString()
        );
        console.log(`Found ${rangeReadings.length} readings in the last 7 days\n`);

        // Test 5: Calculate Statistics
        console.log('Test 5: Calculate Statistics');
        const db = await getDatabase();
        const stats = await db.get(`
            SELECT 
                COUNT(*) as total,
                AVG(temperature) as avg_temp,
                MIN(temperature) as min_temp,
                MAX(temperature) as max_temp,
                AVG(humidity) as avg_humidity,
                MIN(humidity) as min_humidity,
                MAX(humidity) as max_humidity
            FROM temperature_readings
            WHERE device_id = 'TEMO15XP'
        `);
        
        console.log('📊 Statistics:');
        console.log(`  Total Readings: ${stats.total}`);
        console.log(`  Temperature: ${stats.avg_temp?.toFixed(2)}°C (avg), ${stats.min_temp}°C (min), ${stats.max_temp}°C (max)`);
        console.log(`  Humidity: ${stats.avg_humidity?.toFixed(2)}% (avg), ${stats.min_humidity}% (min), ${stats.max_humidity}% (max)`);
        console.log('');

        // Test 6: Pagination
        console.log('Test 6: Test Pagination');
        const page1 = await getReadings(3, 0);
        const page2 = await getReadings(3, 3);
        console.log(`Page 1: ${page1.length} readings`);
        console.log(`Page 2: ${page2.length} readings\n`);

        console.log('✅ All tests passed!\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
    
    process.exit(0);
}

testDatabase();