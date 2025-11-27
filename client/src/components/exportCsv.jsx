export function exportHistoryCsv(readings, filenamePrefix = 'energy_history') {
  if (!Array.isArray(readings) || readings.length === 0) return

  const header = [
    'Timestamp',
    'Voltage (V)',
    'Current (A)',
    'Power (W)',
    'PF',
    'Frequency (Hz)',
    'Energy (kWh)',
  ]

  const safeNum = (val, digits = 2) => {
    if (val === null || val === undefined || Number.isNaN(Number(val))) return '-'
    return Number(val).toFixed(digits)
  }

  const rows = readings.map((r) => [
    new Date(r.timestamp).toLocaleString('id-ID'),
    safeNum(r.voltage, 2),
    safeNum(r.current, 3),
    safeNum(r.active_power, 1),
    safeNum(r.power_factor, 3),
    safeNum(r.frequency, 2),
    safeNum(r.energy_total, 4),
  ])

  const csv = [header, ...rows].map((cols) => cols.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`
  a.click()

  URL.revokeObjectURL(url)
}