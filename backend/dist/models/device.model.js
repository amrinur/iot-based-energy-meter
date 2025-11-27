export class DeviceModel {
    static validateReading(reading) {
        return !!(reading.device_id && typeof reading.temperature === 'number');
    }
}
//# sourceMappingURL=device.model.js.map