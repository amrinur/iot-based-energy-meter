# ✅ Deployment Checklist - Raspberry Pi

## Sebelum Deploy

- [ ] Build berhasil di Windows: `npm run build` (exit code 0)
- [ ] Semua file `.ts` sudah jadi `.js` di folder `dist/`
- [ ] File `.env.raspi` sudah ada (copy ke `.env` di Raspi)
- [ ] Kabel RS-485 siap:
  - USB-to-RS485 converter
  - Kabel A+ dan B- ke energy meter

## Di Raspberry Pi

### Setup Awal (sekali saja)
- [ ] Node.js 18+ terinstall: `node --version`
- [ ] User ditambahkan ke group dialout: `groups | grep dialout`
- [ ] Serial port terdeteksi: `ls -l /dev/ttyUSB0`

### Deploy Project
- [ ] Copy folder `backend/` ke Raspberry Pi
- [ ] `cd backend`
- [ ] `npm install --production`
- [ ] `cp .env.raspi .env`
- [ ] Edit `.env` jika perlu (default sudah OK)

### Test Connection
- [ ] `chmod +x test-deployment.sh`
- [ ] `./test-deployment.sh`
- [ ] Lihat output, harus ada "✅ Modbus connected"

### Verifikasi Settings di Meter
- [ ] Baud rate: **9600** ✅
- [ ] Parity: **none** (8N1) ✅
- [ ] Slave ID: **001** ✅
- [ ] Komunikasi: **RS-485** ✅

### Wiring Check
- [ ] USB converter colokan ke Raspberry Pi
- [ ] A+ (D+) dari converter ke A+ meter
- [ ] B- (D-) dari converter ke B- meter
- [ ] Ground (GND) optional tapi recommended

## Jika Tidak Connect

1. **Swap A+/B-** (tukar polaritas)
2. **Check permissions**: `sudo chmod 666 /dev/ttyUSB0`
3. **Reboot Raspi**: `sudo reboot`
4. **Cek manual meter** untuk register address yang benar

## Production Run

### PM2 (Recommended)
```bash
sudo npm install -g pm2
pm2 start npm --name "energy-monitor" -- start
pm2 save
pm2 startup  # follow instructions
pm2 logs energy-monitor
```

### Manual
```bash
npm start
# Ctrl+C to stop
```

## Expected Console Output

```
✅ Database initialized
🔄 Trying /dev/ttyUSB0 @ 9600, parity=none...
✅ Modbus connected: /dev/ttyUSB0 @ 9600, none
✅ WebSocket server started on port 3000
✅ HTTP server started on port 3000
📊 Reading from 1 device(s) every 5000ms
```

## Monitoring

```bash
# View logs
pm2 logs energy-monitor

# Check status
pm2 status

# Restart if needed
pm2 restart energy-monitor
```

## Auto-Retry Features

Aplikasi akan otomatis mencoba kombinasi ini jika gagal:

1. **Parity**: none → even → odd
2. **Baud**: 9600 → 4800 → 2400 → 1200
3. **Function**: FC3 (Holding) → FC4 (Input)

Jadi **tidak perlu manual config** kecuali sudah tau parameter pastinya.

## Support

Jika masih error:
1. Screenshot console output
2. Output dari `ls -l /dev/ttyUSB*`
3. Settings di LCD energy meter
4. Foto wiring RS-485

---

**Update terakhir**: 21 Nov 2025
**Status**: ✅ Ready for production deployment
**Default config**: 9600 baud, 8N1, Slave ID 1
