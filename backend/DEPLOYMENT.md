# Deployment Guide - Raspberry Pi

## Setup di Raspberry Pi

### 1. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install build tools
sudo apt install -y build-essential git
```

### 2. Copy Project ke Raspberry Pi
```bash
# Di komputer Windows, build dulu
cd backend
npm run build

# Zip project (exclude node_modules)
# Copy ke Raspberry Pi via SCP, USB, atau Git
```

### 3. Setup di Raspberry Pi
```bash
# Clone atau extract project
cd /home/pi/backup-capstone/backend

# Install dependencies
npm install --production

# Copy environment config
cp .env.raspi .env

# Edit .env sesuai kebutuhan
nano .env
```

### 4. Configure Serial Port
```bash
# Check USB-to-RS485 adapter
ls -l /dev/ttyUSB*

# Add user to dialout group
sudo usermod -a -G dialout $USER

# Logout and login again for group to take effect
```

### 5. Test Modbus Connection
```bash
# Build TypeScript
npm run build

# Test connection
node dist/test-tem015xp.js
```

### 6. Run Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 7. Setup Auto-Start (PM2)
```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start npm --name "energy-monitor" -- start

# Save PM2 config
pm2 save

# Setup startup script
pm2 startup
# Follow the instructions shown

# View logs
pm2 logs energy-monitor
```

## Troubleshooting

### Port Permission Error
```bash
# Check permissions
ls -l /dev/ttyUSB0

# Add user to dialout group
sudo usermod -a -G dialout pi
sudo reboot
```

### Connection Timeout
1. Check baud rate di energy meter (harus 9600)
2. Check parity di energy meter (harus none/8N1)
3. Check Slave ID di energy meter (harus 001)
4. Swap kabel RS-485 A+ dan B-
5. Check register address (default 0, coba ubah di modbusConfig.ts)

### Wrong Register Address
Edit `backend/modbus/modbusConfig.ts`:
```typescript
registers: {
    startAddress: 0,  // Ubah sesuai manual TEM015XP
    count: 14         // Sesuaikan jumlah register
}
```

## Environment Variables

File `.env` yang penting:

```bash
# Port serial
MODBUS_PORT=/dev/ttyUSB0

# Baud rate (9600 untuk TEM015XP)
MODBUS_BAUDRATE=9600

# Parity (none untuk 8N1)
MODBUS_PARITY=none

# Slave IDs
MODBUS_SLAVES=[1]

# Reading interval (ms)
READING_INTERVAL=5000
```

## Auto-Retry Feature

Aplikasi sekarang akan otomatis mencoba:
1. Parity: none, even, odd
2. Baud rate: 9600, 4800, 2400
3. Function code: FC3 (Holding), FC4 (Input)

Jadi kalau ada parameter yang salah, akan auto-detect yang benar.

## Monitoring

```bash
# View PM2 status
pm2 status

# View logs
pm2 logs energy-monitor

# Restart service
pm2 restart energy-monitor

# Stop service
pm2 stop energy-monitor
```
