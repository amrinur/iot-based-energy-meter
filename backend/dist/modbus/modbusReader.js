import ModbusRTU from 'modbus-serial';
// Register map berdasarkan manual (Function Code 04 - Read Input Registers)
// Address = Register Number - 30001
const REGISTERS = {
    voltage: { address: 0, length: 2, unit: 'V', name: 'Tegangan' },
    current: { address: 6, length: 2, unit: 'A', name: 'Arus' },
    activePower: { address: 12, length: 2, unit: 'W', name: 'Daya Aktif' },
    apparentPower: { address: 18, length: 2, unit: 'VA', name: 'Daya Semu' },
    reactivePower: { address: 24, length: 2, unit: 'VAr', name: 'Daya Reaktif' },
    powerFactor: { address: 30, length: 2, unit: '', name: 'Power Factor' },
    frequency: { address: 70, length: 2, unit: 'Hz', name: 'Frekuensi' },
    importActiveEnergy: { address: 72, length: 2, unit: 'kWh', name: 'Import Active Energy' },
    exportActiveEnergy: { address: 74, length: 2, unit: 'kWh', name: 'Export Active Energy' },
    importReactiveEnergy: { address: 76, length: 2, unit: 'kvarh', name: 'Import Reactive Energy' },
    exportReactiveEnergy: { address: 78, length: 2, unit: 'kvarh', name: 'Export Reactive Energy' },
};
class ModbusReader {
    client;
    isConnected = false;
    port;
    baudRate;
    parity;
    stopBits;
    dataBits;
    timeout;
    slaveIds;
    constructor() {
        this.client = new ModbusRTU();
        // Read all configurations from .env
        this.port = process.env.MODBUS_PORT || '/dev/ttyUSB0';
        this.baudRate = parseInt(process.env.MODBUS_BAUDRATE || '9600', 10);
        this.parity = (process.env.MODBUS_PARITY || 'even');
        this.stopBits = parseInt(process.env.MODBUS_STOPBITS || '1', 10);
        this.dataBits = parseInt(process.env.MODBUS_DATABITS || '8', 10);
        this.timeout = parseInt(process.env.MODBUS_TIMEOUT || '3000', 10);
        this.slaveIds = JSON.parse(process.env.MODBUS_SLAVES || '[5,2]');
        console.log('📋 Modbus Configuration from .env:');
        console.log(`   Port: ${this.port}`);
        console.log(`   Baud Rate: ${this.baudRate}`);
        console.log(`   Parity: ${this.parity}`);
        console.log(`   Stop Bits: ${this.stopBits}`);
        console.log(`   Data Bits: ${this.dataBits}`);
        console.log(`   Timeout: ${this.timeout}ms`);
        console.log(`   Slave IDs: ${JSON.stringify(this.slaveIds)}`);
    }
    async connect() {
        if (this.isConnected && this.client.isOpen) {
            return true;
        }
        try {
            console.log(`🔄 Connecting to ${this.port} @ ${this.baudRate}, parity=${this.parity}...`);
            await this.client.connectRTU(this.port, {
                baudRate: this.baudRate,
                dataBits: this.dataBits,
                stopBits: this.stopBits,
                parity: this.parity
            });
            this.client.setTimeout(this.timeout);
            this.isConnected = true;
            console.log(`✅ Modbus connected: ${this.port} @ ${this.baudRate}, ${this.parity}`);
            return true;
        }
        catch (err) {
            console.error(`❌ Connection failed: ${err.message}`);
            this.isConnected = false;
            return false;
        }
    }
    async disconnect() {
        if (this.isConnected && this.client.isOpen) {
            try {
                await this.client.close();
                this.isConnected = false;
                console.log('🔌 Modbus disconnected');
            }
            catch (err) {
                console.error('Error disconnecting Modbus:', err.message);
            }
        }
    }
    // Fungsi untuk konversi 2 register (16-bit) menjadi float32
    toFloat32(regA, regB, format = 'ABCD') {
        const buf = Buffer.allocUnsafe(4);
        switch (format) {
            case 'ABCD': // Big Endian
                buf.writeUInt16BE(regA, 0);
                buf.writeUInt16BE(regB, 2);
                break;
            case 'CDAB': // Little Endian words swapped
                buf.writeUInt16BE(regB, 0);
                buf.writeUInt16BE(regA, 2);
                break;
            case 'BADC': // Byte swapped
                buf.writeUInt16LE(regA, 0);
                buf.writeUInt16LE(regB, 2);
                break;
            case 'DCBA': // Full reverse
                buf.writeUInt16LE(regB, 0);
                buf.writeUInt16LE(regA, 2);
                break;
        }
        return parseFloat(buf.readFloatBE(0).toFixed(4));
    }
    // Fungsi untuk membaca satu parameter
    async readParameter(registerInfo) {
        const result = await this.client.readInputRegisters(registerInfo.address, registerInfo.length);
        return this.toFloat32(result.data[0], result.data[1]);
    }
    async readEnergyData(slaveId) {
        this.client.setID(slaveId);
        // Baca semua parameter dengan delay antar pembacaan
        const voltage = await this.readParameter(REGISTERS.voltage);
        await new Promise(resolve => setTimeout(resolve, 100));
        const current = await this.readParameter(REGISTERS.current);
        await new Promise(resolve => setTimeout(resolve, 100));
        const activePower = await this.readParameter(REGISTERS.activePower);
        await new Promise(resolve => setTimeout(resolve, 100));
        const apparentPower = await this.readParameter(REGISTERS.apparentPower);
        await new Promise(resolve => setTimeout(resolve, 100));
        const reactivePower = await this.readParameter(REGISTERS.reactivePower);
        await new Promise(resolve => setTimeout(resolve, 100));
        const powerFactor = await this.readParameter(REGISTERS.powerFactor);
        await new Promise(resolve => setTimeout(resolve, 100));
        const frequency = await this.readParameter(REGISTERS.frequency);
        await new Promise(resolve => setTimeout(resolve, 100));
        const importActiveEnergy = await this.readParameter(REGISTERS.importActiveEnergy);
        await new Promise(resolve => setTimeout(resolve, 100));
        const exportActiveEnergy = await this.readParameter(REGISTERS.exportActiveEnergy);
        await new Promise(resolve => setTimeout(resolve, 100));
        const importReactiveEnergy = await this.readParameter(REGISTERS.importReactiveEnergy);
        await new Promise(resolve => setTimeout(resolve, 100));
        const exportReactiveEnergy = await this.readParameter(REGISTERS.exportReactiveEnergy);
        return {
            slaveId,
            deviceId: `TEM015XP_${slaveId}`,
            meterId: slaveId,
            voltage,
            current,
            active_power: activePower,
            apparent_power: apparentPower,
            reactive_power: reactivePower,
            power_factor: powerFactor,
            frequency,
            import_active_energy: importActiveEnergy,
            export_active_energy: exportActiveEnergy,
            import_reactive_energy: importReactiveEnergy,
            export_reactive_energy: exportReactiveEnergy,
            energy_total: importActiveEnergy, // Total energy = import active energy
            timestamp: new Date().toISOString(),
            success: true
        };
    }
    async readAllDevices() {
        const results = [];
        // Connect sekali di awal
        const connected = await this.connect();
        if (!connected) {
            console.error('⚠️ Cannot connect to Modbus, skipping read cycle');
            return results;
        }
        for (const slaveId of this.slaveIds) {
            try {
                console.log(`📖 Reading from Slave ID ${slaveId}...`);
                // Delay antar device untuk stabilitas
                await new Promise(r => setTimeout(r, 300));
                const data = await this.readEnergyData(slaveId);
                results.push(data);
                console.log(`✅ [Slave ${slaveId}] V:${data.voltage}V I:${data.current}A P:${data.active_power}W PF:${data.power_factor} F:${data.frequency}Hz`);
            }
            catch (err) {
                console.error(`⚠️ [Slave ${slaveId}] Read error:`, err.message);
                results.push({
                    slaveId,
                    deviceId: `TEM015XP_${slaveId}`,
                    meterId: slaveId,
                    voltage: 0,
                    current: 0,
                    active_power: 0,
                    apparent_power: 0,
                    reactive_power: 0,
                    power_factor: 0,
                    frequency: 0,
                    import_active_energy: 0,
                    export_active_energy: 0,
                    import_reactive_energy: 0,
                    export_reactive_energy: 0,
                    energy_total: 0,
                    timestamp: new Date().toISOString(),
                    success: false,
                    error: err.message
                });
            }
        }
        return results;
    }
}
export default ModbusReader;
//# sourceMappingURL=modbusReader.js.map