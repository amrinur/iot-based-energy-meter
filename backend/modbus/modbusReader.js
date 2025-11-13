import ModbusRTU from 'modbus-serial';

class ModbusReader {
    constructor() {
        this.client = new ModbusRTU();
        this.isConnected = false;
        this.port = process.env.MODBUS_PORT || 'COM3';
        this.baudRate = parseInt(process.env.MODBUS_BAUDRATE) || 9600;
        this.slaveId = parseInt(process.env.MODBUS_SLAVE_ID) || 1;
    }

    async connect() {
        try {
            await this.client.connectRTUBuffered(this.port, {
                baudRate: this.baudRate,
                dataBits: 8,
                stopBits: 1,
                parity: 'none'
            });

            this.client.setID(this.slaveId);
            this.client.setTimeout(3000);
            this.isConnected = true;
            console.log(`✅ Modbus connected to ${this.port}`);
            return true;
        } catch (error) {
            console.error('❌ Modbus connection error:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    async readEnergyData() {
        if (!this.isConnected) {
            await this.connect();
        }

        try {
            // TEM015XP Modbus Register Map (sesuaikan dengan datasheet)
            // Biasanya:
            // Register 0-1: Voltage (V) - 2 registers (float/long)
            // Register 2-3: Current (A)
            // Register 4-5: Active Power (W)
            // Register 6-7: Power Factor
            // Register 8-9: Frequency (Hz)
            // Register 10-13: Energy Total (kWh) - 4 registers (double)

            // Baca semua register sekaligus (0-13 = 14 registers)
            const data = await this.client.readHoldingRegisters(0, 14);
            
            // Parse data sesuai format TEM015XP
            // Contoh: jika 2 register per value (32-bit float)
            const voltage = this.parseFloat32(data.data[0], data.data[1]);
            const current = this.parseFloat32(data.data[2], data.data[3]);
            const active_power = this.parseFloat32(data.data[4], data.data[5]);
            const power_factor = this.parseFloat32(data.data[6], data.data[7]);
            const frequency = this.parseFloat32(data.data[8], data.data[9]);
            
            // Energy bisa 4 register (64-bit double) atau 2 register
            const energy_total = this.parseFloat32(data.data[10], data.data[11]);

            return {
                voltage: parseFloat(voltage.toFixed(2)),
                current: parseFloat(current.toFixed(3)),
                active_power: parseFloat(active_power.toFixed(1)),
                power_factor: parseFloat(power_factor.toFixed(3)),
                frequency: parseFloat(frequency.toFixed(2)),
                energy_total: parseFloat(energy_total.toFixed(4)),
                timestamp: new Date().toISOString(),
                success: true
            };
        } catch (error) {
            console.error('❌ Error reading Modbus data:', error.message);
            this.isConnected = false;
            return {
                voltage: null,
                current: null,
                active_power: null,
                power_factor: null,
                frequency: null,
                energy_total: null,
                timestamp: new Date().toISOString(),
                success: false,
                error: error.message
            };
        }
    }

    // Parse 2 registers menjadi float32
    parseFloat32(reg1, reg2) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt16BE(reg1, 0);
        buffer.writeUInt16BE(reg2, 2);
        return buffer.readFloatBE(0);
    }

    // Alternative: jika datanya integer (harus dibagi)
    parseInteger(reg) {
        return reg / 10.0; // Sesuaikan divisor
    }

    async disconnect() {
        if (this.client.isOpen) {
            this.client.close();
            this.isConnected = false;
            console.log('🔌 Modbus disconnected');
        }
    }
}

export default ModbusReader;