import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useWebSocket } from '../../hooks/useWebSocket'
import { energyAPI } from '../services/api'

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

const Dashboard = () => {
  const { data: wsData, isConnected, modbusConnected } = useWebSocket()

  // Daftar device id (hardcode untuk 2 meter, atau ambil dari DB)
  const [devices, setDevices] = useState(['TEM015XP_1', 'TEM015XP_2'])

  // State per device_id
  const [selectedMetrics, setSelectedMetrics] = useState({})
  const [energyData, setEnergyData] = useState({})
  const [chartData, setChartData] = useState({})
  const [inlineExpanded, setInlineExpanded] = useState({})
  const [expandedDeviceId, setExpandedDeviceId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Helper: inisialisasi struktur chart untuk 1 device
  const initChartSeries = () => ({
    energy: [], voltage: [], current: [], power: [], pf: [], frequency: []
  })

  // Load initial data dari database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load recent data untuk mendapatkan data per device
        const response = await energyAPI.getAll(20, 0)
        
        // Initialize state
        const initialMetrics = {}
        const initialEnergy = {}
        const initialCharts = {}
        const initialExpanded = {}

        devices.forEach(deviceId => {
          initialMetrics[deviceId] = 'voltage'
          initialEnergy[deviceId] = null
          initialCharts[deviceId] = initChartSeries()
          initialExpanded[deviceId] = false
        })

        if (response.success && response.data && response.data.length > 0) {
          // Group data by device_id dan ambil yang terbaru per device
          const dataByDevice = {}
          response.data.forEach(reading => {
            const deviceId = reading.device_id
            if (!dataByDevice[deviceId]) {
              dataByDevice[deviceId] = reading // Ambil yang pertama (terbaru)
            }
          })

          // Set data per device
          Object.entries(dataByDevice).forEach(([deviceId, data]) => {
            if (devices.includes(deviceId)) {
              initialEnergy[deviceId] = data

              const time = new Date(data.timestamp).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })

              const seedPoint = {
                energy: data.energy_total || 0,
                voltage: data.voltage || 0,
                current: data.current || 0,
                power: data.active_power || 0,
                pf: data.power_factor || 0,
                frequency: data.frequency || 0,
              }

              initialCharts[deviceId] = Object.fromEntries(
                Object.keys(seedPoint).map(k => [k, [{ time, value: seedPoint[k] }]])
              )
            }
          })

          // Set last update dari data terbaru
          setLastUpdate(new Date(response.data[0].timestamp))
        }

        setSelectedMetrics(initialMetrics)
        setEnergyData(initialEnergy)
        setChartData(initialCharts)
        setInlineExpanded(initialExpanded)
        
      } catch (error) {
        console.error('Error loading initial data:', error)
        
        // Tetap initialize state meskipun error
        const initialMetrics = {}
        const initialEnergy = {}
        const initialCharts = {}
        const initialExpanded = {}

        devices.forEach(deviceId => {
          initialMetrics[deviceId] = 'voltage'
          initialEnergy[deviceId] = null
          initialCharts[deviceId] = initChartSeries()
          initialExpanded[deviceId] = false
        })

        setSelectedMetrics(initialMetrics)
        setEnergyData(initialEnergy)
        setChartData(initialCharts)
        setInlineExpanded(initialExpanded)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Update dari WebSocket
  useEffect(() => {
    if (!wsData) return
    
    console.log('📨 WebSocket data received:', wsData)
    
    if (wsData.type !== 'energy_reading') return
    const deviceId = wsData.deviceId
    if (!deviceId) {
      console.warn('⚠️ No deviceId in wsData')
      return
    }

    console.log(`✅ Updating data for device: ${deviceId}`)

    // Update energy data
    setEnergyData(prev => ({ ...prev, [deviceId]: wsData }))
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

    // Update chart data
    setChartData(prev => {
      const next = { ...prev }
      const base = prev[deviceId] || initChartSeries()
      next[deviceId] = { ...base }

      Object.keys(pointMap).forEach(key => {
        const series = [...(base[key] || [])]
        series.push({ time, value: pointMap[key] })
        if (series.length > 30) series.shift()
        next[deviceId][key] = series
      })

      return next
    })
  }, [wsData])

  const getMetricValue = (deviceId, metricId) => {
    const data = energyData[deviceId]
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
    const digits = metricId === 'current' ? 3
      : metricId === 'power' ? 1
      : metricId === 'energy' ? 4
      : metricId === 'pf' ? 3
      : metricId === 'frequency' ? 2
      : 2
    return Number(val).toFixed(digits)
  }

  const toggleInlineExpand = (deviceId) => {
    setInlineExpanded(prev => ({ ...prev, [deviceId]: !prev[deviceId] }))
  }

  const chartGradient = (deviceId, metricId) => (
    <defs>
      <linearGradient id={`grad-${deviceId}-${metricId}`} x1="0" y1="0" x2="0" y2="1">
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
            <h1 className="text-3xl font-semibold text-white mb-1 tracking-wide">Energy Monitoring Backup</h1>
            <p className="text-sm text-[#b0b0b0]">Realtime dashboard</p>
            {lastUpdate && (
              <p className="text-xs text-[#8a8a8a] mt-1">
                Last update: {lastUpdate.toLocaleTimeString('id-ID')}
              </p>
            )}
          </div>
        </div>

        {isConnected && !modbusConnected && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 text-sm">
            ⚠️ Modbus disconnected. Showing last received data. Real-time updates unavailable.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {devices.map((deviceId) => {
            const selMetric = selectedMetrics[deviceId] || 'voltage'
            const series = chartData[deviceId]?.[selMetric] || []
            const safeSeries = series.length > 0 ? series : [{ time: 'No data', value: 0 }]
            const isInlineOpen = !!inlineExpanded[deviceId]

            return (
              <div
                key={deviceId}
                className={`rounded-xl bg-[#313335] border border-[#4e5254] shadow-[0_4px_18px_-4px_rgba(0,0,0,0.6)] overflow-hidden hover:shadow-purple-900 transition-all duration-300 ${isInlineOpen ? 'xl:col-span-2' : ''}`}
              >
                <div className="px-6 py-4 border-b border-[#4e5254] bg-[#3c3f41] flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-medium tracking-wider text-white">{deviceId}</h2>
                    <p className="text-[10px] mt-1 text-[#b0b0b0] uppercase">Selected: {selMetric}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleInlineExpand(deviceId)}
                      className="text-xs px-3 py-1 rounded-md bg-[#2b2b2b] text-white border border-[#4e5254] hover:border-[#8859ff]"
                    >
                      {isInlineOpen ? 'Collapse' : 'Expand Down'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedDeviceId(deviceId)}
                      className="text-xs px-3 py-1 rounded-md bg-[#2b2b2b] text-white border border-[#4e5254] hover:border-[#8859ff]"
                    >
                      Popup
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="rounded-lg bg-[#2b2b2b] border border-[#4e5254] mb-6 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={safeSeries}>
                        {chartGradient(deviceId, selMetric)}
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
                          fill={`url(#grad-${deviceId}-${selMetric})`}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {metrics.map(metric => {
                      const active = selMetric === metric.id
                      return (
                        <button
                          type="button"
                          key={metric.id}
                          onClick={() => setSelectedMetrics(prev => ({ ...prev, [deviceId]: metric.id }))}
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
                            {getMetricValue(deviceId, metric.id)}
                            <span className="text-[11px] ml-1 font-medium text-[#b0b0b0]">{metric.unit}</span>
                          </span>
                          <span className="mt-1 text-[10px] tracking-wide text-[#b0b0b0]">
                            {metric.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {isInlineOpen && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {metrics.map(metric => {
                        const s = chartData[deviceId]?.[metric.id] || []
                        const safeS = s.length > 0 ? s : [{ time: 'No data', value: 0 }]
                        return (
                          <div key={metric.id} className="rounded-lg bg-[#2b2b2b] border border-[#4e5254] h-[220px] p-3">
                            <div className="text-xs text-[#b0b0b0] mb-2">
                              {metric.label} ({metric.unit})
                            </div>
                            <ResponsiveContainer width="100%" height="80%">
                              <LineChart data={safeS}>
                                {chartGradient(deviceId, metric.id)}
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
                                  fill={`url(#grad-${deviceId}-${metric.id})`}
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

      {/* Popup modal */}
      {expandedDeviceId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-7xl max-h-[90vh] overflow-auto rounded-xl bg-[#313335] border border-[#4e5254] shadow-2xl">
            <div className="px-6 py-4 bg-[#3c3f41] border-b border-[#4e5254] flex items-center justify-between sticky top-0">
              <h3 className="text-white text-sm font-medium tracking-wider">
                {expandedDeviceId} — Semua Grafik
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const idx = devices.findIndex(d => d === expandedDeviceId)
                    const next = devices[(idx + 1) % devices.length]
                    setExpandedDeviceId(next)
                  }}
                  className="text-xs px-3 py-1 rounded-md bg-[#2b2b2b] text-white border border-[#4e5254] hover:border-[#8859ff]"
                >
                  Switch Device
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedDeviceId(null)}
                  className="text-xs px-3 py-1 rounded-md bg-red-600/80 text-white hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {metrics.map(metric => {
                const series = chartData[expandedDeviceId]?.[metric.id] || []
                const safeSeries = series.length > 0 ? series : [{ time: 'No data', value: 0 }]
                return (
                  <div key={metric.id} className="rounded-lg bg-[#2b2b2b] border border-[#4e5254] h-[260px] p-3">
                    <div className="text-xs text-[#b0b0b0] mb-2">
                      {metric.label} ({metric.unit})
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                      <LineChart data={safeSeries}>
                        {chartGradient(expandedDeviceId, metric.id)}
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
                          fill={`url(#grad-${expandedDeviceId}-${metric.id})`}
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