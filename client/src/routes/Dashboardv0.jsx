// import { useState } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// const Dashboard = () => {
//   // State untuk menyimpan parameter yang dipilih untuk setiap meter
//   const [selectedMetrics, setSelectedMetrics] = useState({
//     1: 'voltage', // default untuk meter 1
//     2: 'voltage', // default untuk meter 2
//   });

//   // Dummy data untuk placeholder chart
//   const dummyData = [
//     { time: '00:00', value: 0 },
//     { time: '04:00', value: 0 },
//     { time: '08:00', value: 0 },
//     { time: '12:00', value: 0 },
//     { time: '16:00', value: 0 },
//     { time: '20:00', value: 0 },
//     { time: '24:00', value: 0 },
//   ];

//   const energyMeters = [
//     { id: 1, name: 'ENERGY METER 1' },
//     { id: 2, name: 'ENERGY METER 2' },
//   ];

//   const metrics = [
//     { id: 'energy', label: 'Energi total', value: '0', unit: 'kWh' },
//     { id: 'voltage', label: 'Tegangan', value: '0', unit: 'V' },
//     { id: 'current', label: 'Arus', value: '0', unit: 'A' },
//     { id: 'power', label: 'Daya aktif', value: '0', unit: 'W' },
//     { id: 'pf', label: 'Faktor daya', value: '0', unit: 'PF' },
//     { id: 'frequency', label: 'Frekuensi', value: '0', unit: 'Hz' },
//   ];

//   const handleMetricClick = (meterId, metricId) => {
//     setSelectedMetrics(prev => ({
//       ...prev,
//       [meterId]: metricId
//     }));
//   };

//   return (
//     <div className='flex-1 p-8'>
//       <h1 className='text-3xl font-bold text-gray-800 mb-8'>Dashboard</h1>
      
//       <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
//         {energyMeters.map((meter) => (
//           <div key={meter.id} className='bg-white rounded-lg shadow-md p-6'>
//             {/* Header */}
//             <div className='mb-6'>
//               <h2 className='text-sm font-semibold text-gray-700 mb-4'>{meter.name}</h2>
              
//               {/* Chart Container */}
//               <div className='bg-gray-50 rounded-lg p-4 mb-4' style={{ height: '200px' }}>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={dummyData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                     <XAxis 
//                       dataKey="time" 
//                       tick={{ fontSize: 12, fill: '#6b7280' }}
//                       axisLine={{ stroke: '#d1d5db' }}
//                     />
//                     <YAxis 
//                       tick={{ fontSize: 12, fill: '#6b7280' }}
//                       axisLine={{ stroke: '#d1d5db' }}
//                     />
//                     <Tooltip />
//                     <Line 
//                       type="monotone" 
//                       dataKey="value" 
//                       stroke="#f97316" 
//                       strokeWidth={2}
//                       dot={false}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>


//             {/* Metrics Grid */}
//             <div className='grid grid-cols-3 gap-4'>
//               {metrics.map((metric) => (
//                 <div 
//                   key={metric.id}
//                   onClick={() => handleMetricClick(meter.id, metric.id)}
//                   className={`
//                     text-center p-3 rounded-lg cursor-pointer transition-all duration-200
//                     ${selectedMetrics[meter.id] === metric.id
//                       ? 'bg-blue-100 border-0 border-blue-200'
//                       : 'hover:bg-gray-50 border-2 border-transparent'
//                     }
//                   `}
//                 >
//                   <div className='text-2xl font-bold text-gray-800 mb-1'>
//                     {metric.value} <span className='text-lg text-gray-600'>{metric.unit}</span>
//                   </div>
//                   <div className='text-xs text-gray-600'>
//                     {metric.label}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;