export const modbusConfig = {
    devices: {
        5: {
            name: 'TEM015XP_Device_1',
            registers: {
                startAddress: 0,
                count: 44
            },
            fields: {
                voltage: 0, // 30001
                current: 3, // 30007
                active_power: 6, // 30013
                apparent_power: 9, // 30019
                reactive_power: 12, // 30025
                power_factor: 15, // 30031
                frequency: 18, // 30037
                import_active_energy: 36, // 30073
                export_active_energy: 38, // 30075
                import_reactive_energy: 40, // 30077
                export_reactive_energy: 42, // 30079
                energy_total: 36 // Alias untuk import_active_energy
            }
        },
        2: {
            name: 'TEM015XP_Device_2',
            registers: {
                startAddress: 0,
                count: 44
            },
            fields: {
                voltage: 0,
                current: 3,
                active_power: 6,
                apparent_power: 9,
                reactive_power: 12,
                power_factor: 15,
                frequency: 18,
                import_active_energy: 36,
                export_active_energy: 38,
                import_reactive_energy: 40,
                export_reactive_energy: 42,
                energy_total: 36
            }
        }
    }
};
//# sourceMappingURL=modbusConfig.js.map