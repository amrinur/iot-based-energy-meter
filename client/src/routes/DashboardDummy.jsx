// import { useState} from 'react'
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// const Dashboard = () => {
//   const [selectedMetrics, setSelectedMetrics] = useState({ 1: 'voltage', 2: 'voltage' })

//   const dummyData = [
//     { time: '00:00', value: 0 },
//     { time: '04:00', value: 0 },
//     { time: '08:00', value: 0 },
//     { time: '12:00', value: 0 },
//     { time: '16:00', value: 0 },
//     { time: '20:00', value: 0 },
//     { time: '24:00', value: 0 },
//   ]

//   const energyMeters = [
//     { id: 1, name: 'ENERGY METER 1' },
//     { id: 2, name: 'ENERGY METER 2' },
//   ]

//   const metrics = [
//     { id: 'energy', label: 'Energi total', value: '0', unit: 'kWh' },
//     { id: 'voltage', label: 'Tegangan', value: '0', unit: 'V' },
//     { id: 'current', label: 'Arus', value: '0', unit: 'A' },
//     { id: 'power', label: 'Daya aktif', value: '0', unit: 'W' },
//     { id: 'pf', label: 'Faktor daya', value: '0', unit: 'PF' },
//     { id: 'frequency', label: 'Frekuensi', value: '0', unit: 'Hz' },
//   ]

//   const metricColorMap = {
//     energy: '#ffc100',
//     voltage: '#ff318c',
//     current: '#fc9803',
//     power: '#8859ff',
//     pf: '#59d769',
//     frequency: '#4dabf7',
//   }

//   const handleMetricClick = (meterId, metricId) => {
//     setSelectedMetrics(prev => ({ ...prev, [meterId]: metricId }))
//   }

//   const chartGradient = (meterId) => (
//     <defs>
//       <linearGradient id={`grad-${meterId}`} x1="0" y1="0" x2="0" y2="1">
//         <stop offset="5%" stopColor={metricColorMap[selectedMetrics[meterId]]} stopOpacity={0.9}/>
//         <stop offset="95%" stopColor={metricColorMap[selectedMetrics[meterId]]} stopOpacity={0}/>
//       </linearGradient>
//     </defs>
//   )

//   const lineStroke = (meterId) => metricColorMap[selectedMetrics[meterId]]

//   return (
//     <div className="flex-1 min-h-screen bg-[#2b2b2b] p-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-semibold text-white mb-1 tracking-wide">Energy Monitoring</h1>
//         <p className="text-sm text-[#b0b0b0] mb-8">Realtime dashboard (placeholder)</p>

//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 ">
//           {energyMeters.map(meter => (
//             <div
//               key={meter.id}
//               className="rounded-xl bg-[#313335] border border-[#4e5254] shadow-[0_4px_18px_-4px_rgba(0,0,0,0.6)] overflow-hidden hover:shadow-purple-900 transition-all duration-300 "
//             >
//               <div className="px-6 py-4 border-b border-[#4e5254] bg-[#3c3f41]">
//                 <h2 className="text-sm font-medium tracking-wider text-white">{meter.name}</h2>
//                 <p className="text-[10px] mt-1 text-[#b0b0b0] uppercase">Selected: {selectedMetrics[meter.id]}</p>
//               </div>

//               <div className="p-6">
//                 <div className="rounded-lg bg-[#2b2b2b] border border-[#4e5254] mb-6 h-[220px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={dummyData}>
//                       {chartGradient(meter.id)}
//                       <CartesianGrid strokeDasharray="3 3" stroke="#4e5254" strokeOpacity={0.35}/>
//                       <XAxis
//                         dataKey="time"
//                         tick={{ fontSize: 10, fill: '#b0b0b0' }}
//                         axisLine={{ stroke: '#4e5254' }}
//                         tickLine={{ stroke: '#4e5254' }}
//                       />
//                       <YAxis
//                         tick={{ fontSize: 10, fill: '#b0b0b0' }}
//                         axisLine={{ stroke: '#4e5254' }}
//                         tickLine={{ stroke: '#4e5254' }}
//                       />
//                       <Tooltip
//                         contentStyle={{
//                           background: '#3c3f41',
//                           border: '1px solid #4e5254',
//                           borderRadius: '6px',
//                           color: '#ffffff',
//                           padding: '8px'
//                         }}
//                         labelStyle={{ color: '#ff318c', fontSize: 11 }}
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="value"
//                         stroke={lineStroke(meter.id)}
//                         strokeWidth={2.4}
//                         dot={false}
//                         fill={`url(#grad-${meter.id})`}
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                   {metrics.map(metric => {
//                     const active = selectedMetrics[meter.id] === metric.id
//                     return (
//                       <button
//                         type="button"
//                         key={metric.id}
//                         onClick={() => handleMetricClick(meter.id, metric.id)}
//                         className={`
//                           group flex flex-col items-center justify-center rounded-md px-2 py-3 text-center
//                           border transition relative
//                           ${active
//                             ? 'border border-[#ff318c] bg-[#3c3f41] shadow-[0_0_0_1px_#ff318c,inset_0_0_0_1px_#ff318c]'
//                             : 'border-[#4e5254] bg-[#313335] hover:border-[#8859ff] hover:bg-[#3c3f41]'
//                           }
//                         `}
//                       >
//                         <span className={`text-lg font-semibold ${active ? 'text-white' : 'text-[#e0e0e0]'}`}>
//                           {metric.value}
//                           <span className="text-[11px] ml-1 font-medium text-[#b0b0b0]">{metric.unit}</span>
//                         </span>
//                         <span className="mt-1 text-[10px] tracking-wide text-[#b0b0b0]">
//                           {metric.label}
//                         </span>
//                       </button>
//                     )
//                   })}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   )
// }

// export default Dashboard