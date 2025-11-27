import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useWebSocket } from "../../hooks/useWebSocket"

const Navbar = () => {
  const location = useLocation()
  const { isConnected, modbusConnected } = useWebSocket()

  const [collapsed, setCollapsed] = useState(false)     // desktop: collapse/expand
  const [mobileOpen, setMobileOpen] = useState(false)   // mobile: drawer open/close

  const isActive = (p) => location.pathname === p

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/history", label: "History" },
    { path: "/data-log", label: "Data Log" },
    { path: "/settings", label: "Settings" },
    { path: "/alert", label: "Alert" },
    { path: "/about", label: "About" },
  ]

  const renderLogo = () => (
    <div className={`flex items-center gap-2 transition-all duration-300 ${collapsed ? 'justify-center w-full' : ''}`}>
      <div className="inline-flex items-center justify-center px-0 py-0 rounded-md">
        <img
          src="/uns-logo.png"
          alt="UNS"
          className="w-8 h-8 object-contain"
        />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide text-white">Labkomjar</span>
          <span className="text-[11px] text-[#b0b0b0]">Energy Monitor Backup</span>
        </div>
      )}
    </div>
  )

  const renderStatus = () => (
    <div className="space-y-2">
      {/* WebSocket */}
      <div className="flex items-center text-[11px] space-x-2">
        <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-[#59d769] animate-pulse' : 'bg-red-500'}`} />
        {!collapsed && (
          <span className={isConnected ? 'text-[#59d769]' : 'text-red-400'}>
            WebSocket {isConnected ? 'Online' : 'Offline'}
          </span>
        )}
      </div>

      {/* Modbus */}
      <div className="flex items-center text-[11px] space-x-2">
        <span className={`h-2 w-2 rounded-full ${modbusConnected ? 'bg-blue-400 animate-pulse' : 'bg-yellow-500'}`} />
        {!collapsed && (
          <span className={modbusConnected ? 'text-blue-400' : 'text-yellow-400'}>
            Modbus {modbusConnected ? 'Connected' : 'Disconnected'}
          </span>
        )}
      </div>
    </div>
  )

  const renderNavItems = (forMobile = false) => (
    <ul className={`flex-1 ${forMobile ? 'px-4 py-4 space-y-1' : 'px-2 py-4 space-y-1'}`}>
      {navItems.map(item => {
        const active = isActive(item.path)
        return (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={() => {
                if (forMobile) setMobileOpen(false)
              }}
              className={`
                group flex items-center ${collapsed && !forMobile ? 'justify-center' : 'justify-start'} 
                ${forMobile ? 'px-3 py-2' : 'px-3 py-2'} 
                text-sm rounded-md border transition
                ${active
                  ? 'bg-[#3c3f41] border-[#ff318c] text-white shadow-[0_0_0_1px_#ff318c,inset_0_0_0_1px_#ff318c]'
                  : 'bg-[#313335] border-transparent text-[#b0b0b0] hover:border-[#8859ff] hover:text-white hover:bg-[#3c3f41]'
                }
              `}
              title={collapsed && !forMobile ? item.label : undefined}
            >
              {/* Icon placeholder (bisa diganti ikon beneran) */}
              <span
                className={`
                  
                  ${active ? 'bg-[#ff318c]' : 'bg-[#6c7072]'}
                  ${collapsed && !forMobile ? 'mr-0' : 'mr-2'}
                `}
              />
              {(!collapsed || forMobile) && <span>{item.label}</span>}
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <nav
        className={`
          hidden md:flex flex-col h-screen bg-[#2b2b2b] border-r border-[#4e5254] transition-all duration-300
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Header + toggle */}
<div className={`px-3 py-4 border-b border-[#4e5254] flex items-center justify-between ${collapsed ? 'justify-center' : ''}`}>
  {renderLogo()}
  {!collapsed && (
    <button
      type="button"
      onClick={() => setCollapsed(prev => !prev)}
      className="ml-2 text-[11px] text-[#b0b0b0] hover:text-white bg-[#313335] border border-[#4e5254] rounded px-2 py-1"
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed ? '»' : '«'}
    </button>
  )}
  {collapsed && (
    <button
      type="button"
      onClick={() => setCollapsed(prev => !prev)}
      className="text-[11px] text-[#b0b0b0] hover:text-white bg-[#313335] border border-[#4e5254] rounded px-2 py-1"
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed ? '»' : '«'}
    </button>
  )}
</div>

        {renderNavItems(false)}

        <div className="px-3 py-4 border-t border-[#4e5254]">
          {renderStatus()}
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#2b2b2b] border-b border-[#4e5254] flex items-center justify-between px-4 py-3">
        {renderLogo()}
        <div className="flex items-center gap-3">
          {/* small status dot only on mobile top bar */}
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-[#59d769]' : 'bg-red-500'}`}
            title={`WebSocket ${isConnected ? 'Online' : 'Offline'}`}
          />
          <span
            className={`h-2 w-2 rounded-full ${modbusConnected ? 'bg-blue-400' : 'bg-yellow-500'}`}
            title={`Modbus ${modbusConnected ? 'Connected' : 'Disconnected'}`}
          />
          <button
            type="button"
            onClick={() => setMobileOpen(prev => !prev)}
            className="text-[#e0e0e0] bg-[#313335] border border-[#4e5254] rounded px-3 py-1 text-xs"
          >
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="w-64 bg-[#2b2b2b] border-l border-[#4e5254] flex flex-col max-h-screen">
            <div className="px-4 py-4 border-b border-[#4e5254]">
              {renderLogo()}
            </div>
            {renderNavItems(true)}
            <div className="px-4 py-4 border-t border-[#4e5254]">
              {renderStatus()}
            </div>
          </div>
        </div>
      )}

      {/* Spacer untuk mobile, supaya konten tidak ketutup top bar */}
      <div className="md:hidden h-14" />
    </>
  )
}

export default Navbar