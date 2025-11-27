import { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

const DataLog = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all'); // all, success, error
  const [autoScroll, setAutoScroll] = useState(true);
  const { data: wsData, isConnected } = useWebSocket();

  // Listen to WebSocket data and create transmission logs
  useEffect(() => {
    if (wsData) {
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: wsData.type || 'data',
        status: wsData.success !== false ? 'success' : 'error',
        data: wsData,
        deviceId: wsData.deviceId || wsData.slaveId || 'N/A'
      };

      setLogs(prev => [newLog, ...prev].slice(0, 500)); // Keep last 500 logs

      // Auto-scroll to top if enabled
      if (autoScroll) {
        setTimeout(() => {
          const logContainer = document.getElementById('log-container');
          if (logContainer) {
            logContainer.scrollTop = 0;
          }
        }, 100);
      }
    }
  }, [wsData, autoScroll]);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const clearLogs = () => {
    if (confirm('Hapus semua log transmisi?')) {
      setLogs([]);
    }
  };

  const getStatusColor = (status) => {
    return status === 'success' 
      ? 'bg-green-100 text-green-800 border-green-300' 
      : 'bg-red-100 text-red-800 border-red-300';
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? '✓' : '✗';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Transmission Log</h1>
        <p className="text-gray-600">Real-time Modbus communication log</p>
      </div>

      {/* Connection Status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{logs.length}</span> logs
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
              autoScroll 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {autoScroll ? '📌 Auto-scroll ON' : '📌 Auto-scroll OFF'}
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            🗑️ Clear Logs
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {['all', 'success', 'error'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              filter === f
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {f}
            {f !== 'all' && (
              <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                {logs.filter(l => l.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Log Container */}
      <div 
        id="log-container"
        className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-auto"
        style={{ maxHeight: '600px' }}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">No transmission logs</p>
            <p className="text-sm">Waiting for data from Modbus devices...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLogs.map((log, idx) => (
              <div 
                key={log.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${idx === 0 ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    log.status === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {getStatusIcon(log.status)}
                  </div>

                  {/* Log Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(log.timestamp)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(log.status)}`}>
                          {log.status.toUpperCase()}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          Device: {log.deviceId}
                        </span>
                      </div>
                    </div>

                    {/* Data Details */}
                    {log.data && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {log.data.voltage !== undefined && (
                            <div>
                              <span className="text-gray-500">Voltage:</span>
                              <span className="ml-2 font-semibold text-gray-800">
                                {log.data.voltage?.toFixed(2)} V
                              </span>
                            </div>
                          )}
                          {log.data.current !== undefined && (
                            <div>
                              <span className="text-gray-500">Current:</span>
                              <span className="ml-2 font-semibold text-gray-800">
                                {log.data.current?.toFixed(2)} A
                              </span>
                            </div>
                          )}
                          {log.data.active_power !== undefined && (
                            <div>
                              <span className="text-gray-500">Power:</span>
                              <span className="ml-2 font-semibold text-gray-800">
                                {log.data.active_power?.toFixed(2)} W
                              </span>
                            </div>
                          )}
                          {log.data.frequency !== undefined && (
                            <div>
                              <span className="text-gray-500">Frequency:</span>
                              <span className="ml-2 font-semibold text-gray-800">
                                {log.data.frequency?.toFixed(2)} Hz
                              </span>
                            </div>
                          )}
                          {log.data.power_factor !== undefined && (
                            <div>
                              <span className="text-gray-500">PF:</span>
                              <span className="ml-2 font-semibold text-gray-800">
                                {log.data.power_factor?.toFixed(3)}
                              </span>
                            </div>
                          )}
                          {log.data.energy_total !== undefined && (
                            <div>
                              <span className="text-gray-500">Energy:</span>
                              <span className="ml-2 font-semibold text-gray-800">
                                {log.data.energy_total?.toFixed(2)} kWh
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Error Message */}
                        {log.status === 'error' && log.data.error && (
                          <div className="mt-2 pt-2 border-t border-gray-300">
                            <span className="text-red-600 text-xs font-mono">
                              Error: {log.data.error}
                            </span>
                          </div>
                        )}

                        {/* Raw Data (collapsible) */}
                        <details className="mt-2 pt-2 border-t border-gray-300">
                          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                            Show raw data
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-800">{logs.length}</div>
          <div className="text-sm text-gray-600">Total Transmissions</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-800">
            {logs.filter(l => l.status === 'success').length}
          </div>
          <div className="text-sm text-green-600">Successful</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
          <div className="text-2xl font-bold text-red-800">
            {logs.filter(l => l.status === 'error').length}
          </div>
          <div className="text-sm text-red-600">Failed</div>
        </div>
      </div>
    </div>
  );
};

export default DataLog;
