import { ModbusEnergyData } from '../types/index.js';
declare class ModbusReader {
    private client;
    isConnected: boolean;
    private port;
    private baudRate;
    private parity;
    private stopBits;
    private dataBits;
    private timeout;
    private slaveIds;
    constructor();
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    private toFloat32;
    private readParameter;
    readEnergyData(slaveId: number): Promise<ModbusEnergyData>;
    readAllDevices(): Promise<ModbusEnergyData[]>;
}
export default ModbusReader;
//# sourceMappingURL=modbusReader.d.ts.map