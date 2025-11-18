import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useWebSocket } from '../../hooks/useWebSocket'
import { energyAPI } from '../services/api'

const Dashboard = () => {
  const { data: wsData, isConnected, modbusConnected } = useWebSocket()

  const metrics = [
    { id: 'energy', label: 'Energi total', unit: 'kWh' },
    { id: 'voltage', label: 'Tegangan', unit: 'V' },
    { id: 'current', label: 'Arus', unit: 'A' },
    { id: 'power', label: 'Daya aktif', unit: 'W' },
    { id: 'pf', label: 'Faktor daya', unit: 'PF' },
    { id: 'frequency', label: 'Frekuensi', unit: 'Hz' },
  ]

  const metricColorMap = {
    energy: '#ffc100',
    voltage: '#ff318c',
    current: '#fc9803',
    power: '#8859ff',
    pf: '#59d769',
    frequency: '#4dabf7',
  }

  const [selectedMetrics, setSelectedMetrics] = useState({ 1: 'voltage', 2: 'voltage' })
  const [energyData, setEnergyData] = useState({ 1: null, 2: null })

  // Chart data per meter per metric
  const [chartData, setChartData] = useState({
    1: { energy: [], voltage: [], current: [], power: [], pf: [], frequency: [] },
    2: { energy: [], voltage: [], current: [], power: [], pf: [], frequency: [] },
  })

  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Expanded modal state (popup)
  const [expandedMeterId, setExpandedMeterId] = useState(null)

  // Inline expand state (per card, memanjang ke bawah)
  const [inlineExpanded, setInlineExpanded] = useState({ 1: false, 2: false })

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  // Update from WebSocket
  useEffect(() => {
    if (wsData && wsData.type === 'energy_reading') {
      const meterId = wsData.deviceId === 'TEM015XP_1' ? 1 : 2

      setEnergyData(prev => ({ ...prev, [meterId]: wsData }))
      setLastUpdate(new Date())

      const time = new Date(wsData.timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      const pointMap = {
        energy: wsData.energy_total || 0,
        voltage: wsData.voltage || 0,
        current: wsData.current || 0,
        power: wsData.active_power || 0,
        pf: wsData.power_factor || 0,
        frequency: wsData.frequency || 0,
      }

      setChartData(prev => {
        const next = {
          ...prev,
          [meterId]: { ...prev[meterId] }
        }

        Object.keys(pointMap).forEach(key => {
          const series = [...(prev[meterId][key] || [])]
          series.push({ time, value: pointMap[key] })
          if (series.length > 30) series.shift() // simpan 30 titik terakhir
          next[meterId][key] = series
        })

        return next
      })
    }
  }, [wsData])

  const loadInitialData = async () => {
    try {
      const response = await energyAPI.getLatest()
      if (response.success && response.data) {
        setEnergyData({ 1: response.data, 2: response.data }) // demo: sama
        setLastUpdate(new Date(response.data.timestamp))

        // seed satu titik ke semua metrik agar chart tidak kosong
        const time = new Date(response.data.timestamp).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        const seedPoint = {
          energy: response.data.energy_total || 0,
          voltage: response.data.voltage || 0,
          current: response.data.current || 0,
          power: response.data.active_power || 0,
          pf: response.data.power_factor || 0,
          frequency: response.data.frequency || 0,
        }

        setChartData({
          1: Object.fromEntries(Object.keys(seedPoint).map(k => [k, [{ time, value: seedPoint[k] }]])),
          2: Object.fromEntries(Object.keys(seedPoint).map(k => [k, [{ time, value: seedPoint[k] }]])),
        })
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const energyMeters = [
    { id: 1, name: 'ENERGY METER 1' },
    { id: 2, name: 'ENERGY METER 2' },
  ]

  const getMetricValue = (meterId, metricId) => {
    const data = energyData[meterId]
    if (!data) return '0'
    const valueMap = {
      energy: data.energy_total,
      voltage: data.voltage,
      current: data.current,
      power: data.active_power,
      pf: data.power_factor,
      frequency: data.frequency,
    }
    const val = valueMap[metricId]
    if (val === null || val === undefined) return '0'
    const digits = metricId === 'current' ? 3 : metricId === 'power' ? 1 : metricId === 'energy' ? 4 : metricId === 'pf' ? 3 : metricId === 'frequency' ? 2 : 2
    return Number(val).toFixed(digits)
  }

  const _handleMetricClick = (meterId, metricId) => {
    setSelectedMetrics(prev => ({ ...prev, [meterId]: metricId }))
  }

  const toggleInlineExpand = (meterId) => {
    setInlineExpanded(prev => ({ ...prev, [meterId]: !prev[meterId] }))
  }

  const chartGradient = (meterId, metricId) => (
    <defs>
      <linearGradient id={`grad-${meterId}-${metricId}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={metricColorMap[metricId]} stopOpacity={0.9} />
        <stop offset="95%" stopColor={metricColorMap[metricId]} stopOpacity={0} />
      </linearGradient>
    </defs>
  )

  const lineStroke = (metricId) => metricColorMap[metricId]

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-[#2b2b2b] p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-screen bg-[#2b2b2b] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-1 tracking-wide">Energy Monitoring</h1>
            <p className="text-sm text-[#b0b0b0]">Realtime dashboard</p>
            {lastUpdate && (
              <p className="text-xs text-[#8a8a8a] mt-1">
                Last update: {lastUpdate.toLocaleTimeString('id-ID')}
              </p>
            )}
          </div>

          {/* <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full text-xs font-medium border flex items-center gap-2 ${
              isConnected ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-red-900/20 text-red-400 border-red-500/30'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span>WebSocket</span>
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-medium border flex items-center gap-2 ${
              modbusConnected ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' : 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30'
            }`}>
              <span className={`h-2 w-2 rounded-full ${modbusConnected ? 'bg-blue-400 animate-pulse' : 'bg-yellow-400'}`} />
              <span>Modbus</span>
            </div>
          </div> */}
        </div>

        {isConnected && !modbusConnected && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 text-sm">
            ⚠️ Modbus disconnected. Showing last received data. Real-time updates unavailable.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {energyMeters.map(meter => {
            const selMetric = selectedMetrics[meter.id]
            const series = chartData[meter.id][selMetric]
            const safeSeries = (series && series.length > 0) ? series : [{ time: 'No data', value: 0 }]
            const isInlineOpen = inlineExpanded[meter.id]

            return (
              <div
                key={meter.id}
                className={`rounded-xl bg-[#313335] border border-[#4e5254] shadow-[0_4px_18px_-4px_rgba(0,0,0,0.6)] overflow-hidden hover:shadow-purple-900 transition-all duration-300 ${isInlineOpen ? 'xl:col-span-2' : ''}`}
              >
                <div className="px-6 py-4 border-b border-[#4e5254] bg-[#3c3f41] flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-medium tracking-wider text-white">{meter.name}</h2>
                    <p className="text-[10px] mt-1 text-[#b0b0b0] uppercase">Selected: {selMetric}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Tombol baru: Expand Down (inline) */}
                    <button
                      type="button"
                      onClick={() => toggleInlineExpand(meter.id)}
                      className="text-xs px-3 py-1 rounded-md bg-[#2b2b2b] text-white border border-[#4e5254] hover:border-[#8859ff]"
                    >
                      {isInlineOpen ? 'Collapse' : 'Expand Down'}
                    </button>

                    {/* Tombol lama: Popup modal */}
                    <button
                      type="button"
                      onClick={() => setExpandedMeterId(meter.id)}
                      className="text-xs px-3 py-1 rounded-md bg-[#2b2b2b] text-white border border-[#4e5254] hover:border-[#8859ff]"
                    >
                      Popup
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Chart utama (selected metric) */}
                  <div className="rounded-lg bg-[#2b2b2b] border border-[#4e5254] mb-6 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={safeSeries}>
                        {chartGradient(meter.id, selMetric)}
                        <CartesianGrid strokeDasharray="3 3" stroke="#4e5254" strokeOpacity={0.35} />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 10, fill: '#b0b0b0' }}
                          axisLine={{ stroke: '#4e5254' }}
                          tickLine={{ stroke: '#4e5254' }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#b0b0b0' }}
                          axisLine={{ stroke: '#4e5254' }}
                          tickLine={{ stroke: '#4e5254' }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#3c3f41',
                            border: '1px solid #4e5254',
                            borderRadius: '6px',
                            color: '#ffffff',
                            padding: '8px',
                          }}
                          labelStyle={{ color: '#ff318c', fontSize: 11 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={lineStroke(selMetric)}
                          strokeWidth={2.4}
                          dot={false}
                          fill={`url(#grad-${meter.id}-${selMetric})`}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tombol metric */}
                  <div className="grid grid-cols-3 gap-4">
                    {metrics.map(metric => {
                      const active = selMetric === metric.id
                      return (
                        <button
                          type="button"
                          key={metric.id}
                          onClick={() => setSelectedMetrics(prev => ({ ...prev, [meter.id]: metric.id }))}
                          className={`
                            group flex flex-col items-center justify-center rounded-md px-2 py-3 text-center
                            border transition relative
                            ${active
                              ? 'border border-[#ff318c] bg-[#3c3f41] shadow-[0_0_0_1px_#ff318c,inset_0_0_0_1px_#ff318c]'
                              : 'border-[#4e5254] bg-[#313335] hover:border-[#8859ff] hover:bg-[#3c3f41]'
                            }
                          `}
                        >
                          <span className={`text-lg font-semibold ${active ? 'text-white' : 'text-[#e0e0e0]'}`}>
                            {getMetricValue(meter.id, metric.id)}
                            <span className="text-[11px] ml-1 font-medium text-[#b0b0b0]">{metric.unit}</span>
                          </span>
                          <span className="mt-1 text-[10px] tracking-wide text-[#b0b0b0]">
                            {metric.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Inline expanded section: tampilkan semua grafik metrik */}
                  {isInlineOpen && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {metrics.map(metric => {
                        const s = chartData[meter.id][metric.id]
                        const safeS = (s && s.length > 0) ? s : [{ time: 'No data', value: 0 }]
                        return (
                          <div key={metric.id} className="rounded-lg bg-[#2b2b2b] border border-[#4e5254] h-[220px] p-3">
                            <div className="text-xs text-[#b0b0b0] mb-2">
                              {metric.label} ({metric.unit})
                            </div>
                            <ResponsiveContainer width="100%" height="80%">
                              <LineChart data={safeS}>
                                {chartGradient(meter.id, metric.id)}
                                <CartesianGrid strokeDasharray="3 3" stroke="#4e5254" strokeOpacity={0.35} />
                                <XAxis
                                  dataKey="time"
                                  tick={{ fontSize: 10, fill: '#b0b0b0' }}
                                  axisLine={{ stroke: '#4e5254' }}
                                  tickLine={{ stroke: '#4e5254' }}
                                />
                                <YAxis
                                  tick={{ fontSize: 10, fill: '#b0b0b0' }}
                                  axisLine={{ stroke: '#4e5254' }}
                                  tickLine={{ stroke: '#4e5254' }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    background: '#3c3f41',
                                    border: '1px solid #4e5254',
                                    borderRadius: '6px',
                                    color: '#ffffff',
                                    padding: '8px',
                                  }}
                                  labelStyle={{ color: '#ff318c', fontSize: 11 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke={lineStroke(metric.id)}
                                  strokeWidth={2.2}
                                  dot={false}
                                  fill={`url(#grad-${meter.id}-${metric.id})`}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Expanded Modal: tampilkan semua grafik metrik untuk meter terpilih */}
      {expandedMeterId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-7xl max-h-[90vh] overflow-auto rounded-xl bg-[#313335] border border-[#4e5254] shadow-2xl">
            <div className="px-6 py-4 bg-[#3c3f41] border-b border-[#4e5254] flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-3">
                <h3 className="text-white text-sm font-medium tracking-wider">
                  {expandedMeterId === 1 ? 'ENERGY METER 1' : 'ENERGY METER 2'} — Semua Grafik
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedMeterId(expandedMeterId === 1 ? 2 : 1)}
                  className="text-xs px-3 py-1 rounded-md bg-[#2b2b2b] text-white border border-[#4e5254] hover:border-[#8859ff]"
                >
                  {expandedMeterId === 1 ? 'Switch ke Meter 2' : 'Switch ke Meter 1'}
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedMeterId(null)}
                  className="text-xs px-3 py-1 rounded-md bg-red-600/80 text-white hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {metrics.map(metric => {
                const series = chartData[expandedMeterId][metric.id]
                const safeSeries = (series && series.length > 0) ? series : [{ time: 'No data', value: 0 }]
                return (
                  <div key={metric.id} className="rounded-lg bg-[#2b2b2b] border border-[#4e5254] h-[260px] p-3">
                    <div className="text-xs text-[#b0b0b0] mb-2">
                      {metric.label} ({metric.unit})
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                      <LineChart data={safeSeries}>
                        {chartGradient(expandedMeterId, metric.id)}
                        <CartesianGrid strokeDasharray="3 3" stroke="#4e5254" strokeOpacity={0.35} />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 10, fill: '#b0b0b0' }}
                          axisLine={{ stroke: '#4e5254' }}
                          tickLine={{ stroke: '#4e5254' }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#b0b0b0' }}
                          axisLine={{ stroke: '#4e5254' }}
                          tickLine={{ stroke: '#4e5254' }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#3c3f41',
                            border: '1px solid #4e5254',
                            borderRadius: '6px',
                            color: '#ffffff',
                            padding: '8px',
                          }}
                          labelStyle={{ color: '#ff318c', fontSize: 11 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={lineStroke(metric.id)}
                          strokeWidth={2.2}
                          dot={false}
                          fill={`url(#grad-${expandedMeterId}-${metric.id})`}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard