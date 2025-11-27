export interface ModbusRegistersConfig {
    startAddress: number;
    count: number;
}
export interface ModbusFieldMap {
    voltage: number;
    current: number;
    active_power: number;
    power_factor: number;
    frequency: number;
    energy_total: number;
}
export interface ModbusConversionConfig {
    voltageDivisor: number;
    currentDivisor: number;
    powerDivisor: number;
}
export interface ModbusConnectionConfig {
    baudRate: number;
    dataBits: number;
    stopBits: number;
    parity: 'none' | 'even' | 'odd';
    timeout: number;
    retryDelay: number;
}
export interface ModbusDeviceConfig {
    slaveId: number;
    registers: ModbusRegistersConfig;
    fields: ModbusFieldMap;
    conversion: ModbusConversionConfig;
}
export interface ModbusConfig {
    port: string;
    connection: ModbusConnectionConfig;
    devices: Record<number, ModbusDeviceConfig>;
}
export declare const modbusConfig: {
    devices: {
        5: {
            name: string;
            registers: {
                startAddress: number;
                count: number;
            };
            fields: {
                voltage: number;
                current: number;
                active_power: number;
                apparent_power: number;
                reactive_power: number;
                power_factor: number;
                frequency: number;
                import_active_energy: number;
                export_active_energy: number;
                import_reactive_energy: number;
                export_reactive_energy: number;
                energy_total: number;
            };
        };
        2: {
            name: string;
            registers: {
                startAddress: number;
                count: number;
            };
            fields: {
                voltage: number;
                current: number;
                active_power: number;
                apparent_power: number;
                reactive_power: number;
                power_factor: number;
                frequency: number;
                import_active_energy: number;
                export_active_energy: number;
                import_reactive_energy: number;
                export_reactive_energy: number;
                energy_total: number;
            };
        };
    };
};
//# sourceMappingURL=modbusConfig.d.ts.map