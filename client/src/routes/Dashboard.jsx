import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useWebSocket } from '../../hooks/useWebSocket'
import { energyAPI } from '../services/api'

const Dashboard = () => {
  const { data: wsData, isConnected, modbusConnected } = useWebSocket()
  const [selectedMetrics, setSelectedMetrics] = useState({ 1: 'voltage', 2: 'voltage' })
  const [energyData, setEnergyData] = useState({
    1: null,
    2: null
  })
  const [chartData, setChartData] = useState({
    1: [],
    2: []
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  // Update from WebSocket
  useEffect(() => {
    if (wsData && wsData.type === 'energy_reading') {
      const meterId = wsData.deviceId === 'TEM015XP_1' ? 1 : 2
      
      setEnergyData(prev => ({
        ...prev,
        [meterId]: wsData
      }))

      setLastUpdate(new Date())

      // Update chart data
      setChartData(prev => {
        const newData = [...prev[meterId]]
        const time = new Date(wsData.timestamp).toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        })
        
        newData.push({
          time,
          value: wsData[selectedMetrics[meterId]] || 0
        })

        // Keep only last 10 points
        if (newData.length > 10) newData.shift()

        return {
          ...prev,
          [meterId]: newData
        }
      })
    }
  }, [wsData, selectedMetrics])

  const loadInitialData = async () => {
    try {
      const response = await energyAPI.getLatest()
      if (response.success && response.data) {
        setEnergyData({
          1: response.data,
          2: response.data // Untuk demo, pakai data yang sama
        })
        setLastUpdate(new Date(response.data.timestamp))
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

    return valueMap[metricId]?.toFixed(2) || '0'
  }

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

  const handleMetricClick = (meterId, metricId) => {
    setSelectedMetrics(prev => ({ ...prev, [meterId]: metricId }))
  }

  const chartGradient = (meterId) => (
    <defs>
      <linearGradient id={`grad-${meterId}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={metricColorMap[selectedMetrics[meterId]]} stopOpacity={0.9}/>
        <stop offset="95%" stopColor={metricColorMap[selectedMetrics[meterId]]} stopOpacity={0}/>
      </linearGradient>
    </defs>
  )

  const lineStroke = (meterId) => metricColorMap[selectedMetrics[meterId]]

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
          
          <div className="flex items-center gap-3">
            {/* WebSocket Status */}
            <div className={`px-4 py-2 rounded-full text-xs font-medium border flex items-center gap-2 ${
              isConnected 
                ? 'bg-green-900/20 text-green-400 border-green-500/30' 
                : 'bg-red-900/20 text-red-400 border-red-500/30'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span>WebSocket</span>
            </div>

            {/* Modbus Status */}
            <div className={`px-4 py-2 rounded-full text-xs font-medium border flex items-center gap-2 ${
              modbusConnected 
                ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' 
                : 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30'
            }`}>
              <span className={`h-2 w-2 rounded-full ${modbusConnected ? 'bg-blue-400 animate-pulse' : 'bg-yellow-400'}`} />
              <span>Modbus</span>
            </div>
          </div>
        </div>

        {/* Warning jika Modbus disconnect */}
        {isConnected && !modbusConnected && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 text-sm">
            ⚠️ Modbus disconnected. Showing last received data. Real-time updates unavailable.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {energyMeters.map(meter => (
            <div
              key={meter.id}
              className="rounded-xl bg-[#313335] border border-[#4e5254] shadow-[0_4px_18px_-4px_rgba(0,0,0,0.6)] overflow-hidden hover:shadow-purple-900 transition-all duration-300"
            >
              <div className="px-6 py-4 border-b border-[#4e5254] bg-[#3c3f41]">
                <h2 className="text-sm font-medium tracking-wider text-white">{meter.name}</h2>
                <p className="text-[10px] mt-1 text-[#b0b0b0] uppercase">Selected: {selectedMetrics[meter.id]}</p>
              </div>

              <div className="p-6">
                <div className="rounded-lg bg-[#2b2b2b] border border-[#4e5254] mb-6 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData[meter.id].length > 0 ? chartData[meter.id] : [{ time: 'No data', value: 0 }]}>
                      {chartGradient(meter.id)}
                      <CartesianGrid strokeDasharray="3 3" stroke="#4e5254" strokeOpacity={0.35}/>
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
                          padding: '8px'
                        }}
                        labelStyle={{ color: '#ff318c', fontSize: 11 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={lineStroke(meter.id)}
                        strokeWidth={2.4}
                        dot={false}
                        fill={`url(#grad-${meter.id})`}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {metrics.map(metric => {
                    const active = selectedMetrics[meter.id] === metric.id
                    return (
                      <button
                        type="button"
                        key={metric.id}
                        onClick={() => handleMetricClick(meter.id, metric.id)}
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard