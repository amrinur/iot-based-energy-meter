import { Link, useLocation } from "react-router-dom"
import { useWebSocket } from "../../hooks/useWebSocket" // Fix: tambah ../../

const Navbar = () => {
  const location = useLocation()
  const { isConnected, modbusConnected } = useWebSocket()
  const isActive = (p) => location.pathname === p

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/history", label: "History" },
    { path: "/data-log", label: "Data Log" },
    { path: "/settings", label: "Settings" },
    { path: "/alert", label: "Alert" },
    { path: "/about", label: "About" },
  ]

  return (
    <nav className="h-screen w-64 flex flex-col bg-[#2b2b2b] border-r border-[#4e5254]">
      <div className="px-6 py-7 border-b border-[#4e5254]">
        <div className="inline-flex items-center px-3 py-2 rounded-md bg-gradient-to-br from-[#ff318c] via-[#fc9803] to-[#8859ff]">
          <span className="text-sm font-semibold tracking-wide text-white">UNS</span>
        </div>
        <p className="mt-3 text-xs text-[#b0b0b0]">Energy Monitor</p>
      </div>

      <ul className="flex-1 px-4 py-4 space-y-1">
        {navItems.map(item => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`
                group flex items-center px-3 py-2 text-sm rounded-md border transition
                ${isActive(item.path)
                  ? 'bg-[#3c3f41] border-[#ff318c] text-white shadow-[0_0_0_1px_#ff318c,inset_0_0_0_1px_#ff318c]'
                  : 'bg-[#313335] border-transparent text-[#b0b0b0] hover:border-[#8859ff] hover:text-white hover:bg-[#3c3f41]'
                }
              `}
            >
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="px-5 py-4 space-y-3 border-t border-[#4e5254]">
        {/* WebSocket Status */}
        <div className="flex items-center text-xs space-x-2">
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-[#59d769] animate-pulse' : 'bg-red-500'}`} />
          <span className={isConnected ? 'text-[#59d769]' : 'text-red-400'}>
            WebSocket {isConnected ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Modbus Status */}
        <div className="flex items-center text-xs space-x-2">
          <span className={`h-2 w-2 rounded-full ${modbusConnected ? 'bg-blue-400 animate-pulse' : 'bg-yellow-500'}`} />
          <span className={modbusConnected ? 'text-blue-400' : 'text-yellow-400'}>
            Modbus {modbusConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar