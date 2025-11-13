import { useEffect, useMemo, useState } from 'react'
import { energyAPI } from '../services/api'

const History = () => {
  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [limit, setLimit] = useState(25)
  const [offset, setOffset] = useState(0)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)

  useEffect(() => {
    loadReadings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset])

  const loadReadings = async () => {
    if (isFiltering) return
    setLoading(true)
    setError(null)
    try {
      const res = await energyAPI.getAll(limit, offset)
      if (res?.success) setReadings(res.data || [])
    } catch (e) {
      setError('Gagal memuat data')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      alert('Pilih Start Date dan End Date')
      return
    }
    setIsFiltering(true)
    setLoading(true)
    setError(null)
    try {
      const res = await energyAPI.getByDateRange(startDate, endDate)
      if (res?.success) {
        setReadings(res.data || [])
        setOffset(0)
      }
    } catch (e) {
      setError('Gagal memfilter data')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const resetFilter = () => {
    setStartDate('')
    setEndDate('')
    setIsFiltering(false)
    setOffset(0)
    loadReadings()
  }

  const canPrev = useMemo(() => offset > 0, [offset])
  const canNext = useMemo(() => !isFiltering && readings.length === limit, [isFiltering, readings.length, limit])

  const exportCSV = () => {
    if (!readings?.length) return
    const header = ['Timestamp', 'Voltage (V)', 'Current (A)', 'Power (W)', 'PF', 'Frequency (Hz)', 'Energy (kWh)']
    const rows = readings.map(r => ([
      new Date(r.timestamp).toLocaleString('id-ID'),
      safeNum(r.voltage, 2),
      safeNum(r.current, 3),
      safeNum(r.active_power, 1),
      safeNum(r.power_factor, 3),
      safeNum(r.frequency, 2),
      safeNum(r.energy_total, 4),
    ]))
    const csv = [header, ...rows].map(cols => cols.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `energy_history_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 min-h-screen bg-[#2b2b2b] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-1 tracking-wide">History Data</h1>
            <p className="text-sm text-[#b0b0b0]">Riwayat pembacaan energi TEM015XP</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-md text-sm font-medium bg-[#3c3f41] border border-[#4e5254] text-white hover:border-[#8859ff]"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter & Controls */}
        <div className="rounded-xl bg-[#313335] border border-[#4e5254] mb-6">
          <div className="px-6 py-4 border-b border-[#4e5254] bg-[#3c3f41]">
            <h2 className="text-sm font-medium tracking-wider text-white">Filter</h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-[#b0b0b0] mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#2b2b2b] text-white border border-[#4e5254] rounded px-3 py-2 focus:outline-none focus:border-[#8859ff]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#b0b0b0] mb-1">End Date</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#2b2b2b] text-white border border-[#4e5254] rounded px-3 py-2 focus:outline-none focus:border-[#8859ff]"
              />
            </div>
            <div className="flex items-end gap-3">
              <button
                onClick={handleFilter}
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-500"
              >
                Apply
              </button>
              <button
                onClick={resetFilter}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 text-white hover:bg-gray-500"
              >
                Reset
              </button>
            </div>
            <div className="flex items-end justify-end gap-3">
              <div>
                <label className="block text-xs text-[#b0b0b0] mb-1">Rows per page</label>
                <select
                  value={limit}
                  onChange={(e) => { setOffset(0); setLimit(Number(e.target.value)) }}
                  className="bg-[#2b2b2b] text-white border border-[#4e5254] rounded px-3 py-2 focus:outline-none focus:border-[#8859ff]"
                >
                  {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-[#313335] border border-[#4e5254] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#4e5254] bg-[#3c3f41] flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-wider text-white">Tabel Riwayat</h2>
            {!isFiltering && (
              <div className="flex items-center gap-2">
                <button
                  disabled={!canPrev || loading}
                  onClick={() => canPrev && setOffset(Math.max(0, offset - limit))}
                  className={`px-3 py-1 rounded-md text-xs border ${
                    canPrev && !loading
                      ? 'bg-[#3c3f41] border-[#4e5254] text-white hover:border-[#8859ff]'
                      : 'bg-[#2b2b2b] border-[#4e5254] text-[#8a8a8a] cursor-not-allowed'
                  }`}
                >
                  Prev
                </button>
                <button
                  disabled={!canNext || loading}
                  onClick={() => canNext && setOffset(offset + limit)}
                  className={`px-3 py-1 rounded-md text-xs border ${
                    canNext && !loading
                      ? 'bg-[#3c3f41] border-[#4e5254] text-white hover:border-[#8859ff]'
                      : 'bg-[#2b2b2b] border-[#4e5254] text-[#8a8a8a] cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
                <span className="text-xs text-[#b0b0b0] ml-2">
                  {isFiltering ? 'Filtered results' : `Offset ${offset}`}
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#b0b0b0]">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : readings.length === 0 ? (
            <div className="p-8 text-center text-[#b0b0b0]">No data found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#2f3133]">
                  <tr className="text-left">
                    <Th>Timestamp</Th>
                    <Th>Voltage (V)</Th>
                    <Th>Current (A)</Th>
                    <Th>Power (W)</Th>
                    <Th>PF</Th>
                    <Th>Frequency (Hz)</Th>
                    <Th>Energy (kWh)</Th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((r) => (
                    <tr key={r.id} className="border-t border-[#4e5254] hover:bg-[#373a3c]">
                      <Td>{new Date(r.timestamp).toLocaleString('id-ID')}</Td>
                      <Td mono>{safeNum(r.voltage, 2)}</Td>
                      <Td mono>{safeNum(r.current, 3)}</Td>
                      <Td mono>{safeNum(r.active_power, 1)}</Td>
                      <Td mono>{safeNum(r.power_factor, 3)}</Td>
                      <Td mono>{safeNum(r.frequency, 2)}</Td>
                      <Td mono>{safeNum(r.energy_total, 4)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Th({ children }) {
  return (
    <th className="px-6 py-3 text-xs font-medium text-[#b0b0b0] uppercase border-b border-[#4e5254]">
      {children}
    </th>
  )
}

function Td({ children, mono = false }) {
  return (
    <td className={`px-6 py-3 text-sm ${mono ? 'font-mono text-[#e0e0e0]' : 'text-[#d6d6d6]'}`}>
      {children}
    </td>
  )
}

function safeNum(val, digits = 2) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '-'
  const n = Number(val)
  return n.toFixed(digits)
}

export default History