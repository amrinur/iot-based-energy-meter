export const modbusConfig = {
    // Thera Temo15XP Configuration
    registers: {
        temperature: 0,  // Holding register address for temperature
        humidity: 1,     // Holding register address for humidity
        count: 2         // Number of registers to read
    },
    
    // Data conversion
    conversion: {
        temperatureDivisor: 10,  // Divide by 10 to get actual temperature
        humidityDivisor: 10      // Divide by 10 to get actual humidity
    },
    
    // Connection settings
    connection: {
        timeout: 3000,           // Connection timeout in ms
        retryDelay: 10000,       // Retry delay after failed connection
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
    }
};