'use client'

import { useState } from 'react'
import MetricCard from '@/components/admin/MetricCard'
import ReservaCard from '@/components/admin/ReservaCard'

type NavItem = { label: string; icon: React.ReactNode; id: string }

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  },
  {
    id: 'reservas', label: 'Reservas',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  },
  {
    id: 'calendario', label: 'Calendario',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  },
  {
    id: 'servicios', label: 'Servicios',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>,
  },
  {
    id: 'clientes', label: 'Clientes',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>,
  },
  {
    id: 'ajustes', label: 'Ajustes',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  },
]

const RESERVAS_MOCK = [
  { numero: 'PM-2026-1421', clienteNombre: 'Ana García', servicioNombre: 'Cumpleaños', fecha: '2026-06-07', hora_inicio: '11:00', estado: 'confirmada' as const, total: 18000 },
  { numero: 'PM-2026-1420', clienteNombre: 'Carlos López', servicioNombre: 'Acrobacia', fecha: '2026-06-07', hora_inicio: '10:00', estado: 'pendiente' as const, total: 1200 },
  { numero: 'PM-2026-1419', clienteNombre: 'María Sanz', servicioNombre: 'Circo', fecha: '2026-06-06', hora_inicio: '17:30', estado: 'pagada' as const, total: 1200 },
  { numero: 'PM-2026-1418', clienteNombre: 'Pedro Ruiz', servicioNombre: 'Empresa', fecha: '2026-06-05', hora_inicio: '10:00', estado: 'pendiente' as const, total: 30000 },
  { numero: 'PM-2026-1417', clienteNombre: 'Laura Martín', servicioNombre: 'Campamento', fecha: '2026-06-04', hora_inicio: '09:00', estado: 'cancelada' as const, total: 20000 },
]

export default function AdminPage() {
  const [activeNav, setActiveNav] = useState('dashboard')

  const today = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  return (
    <div className="min-h-screen flex bg-pm-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-pm-navy text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="font-black text-xl tracking-tight">
            <span className="text-pm-red">PM</span> Admin
          </div>
          <div className="text-gray-400 text-xs mt-1">Planeta Movimiento</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeNav === item.id
                  ? 'bg-pm-red text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-pm-navy">Buenos días 👋</h1>
            <p className="text-sm text-gray-500 capitalize">{today}</p>
          </div>
          <button className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
            + Nueva reserva
          </button>
        </header>

        <div className="p-8 space-y-8">
          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard label="Reservas hoy" valor="3" tendencia="↑ 1 vs ayer" positivo />
            <MetricCard label="Esta semana" valor="12" />
            <MetricCard label="Ingresos mes" valor="1.847€" tendencia="↑ 14% vs mes anterior" positivo />
            <MetricCard label="Pendientes de confirmar" valor="2" tendencia="Requieren atención" positivo={false} />
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-pm-navy">Reservas recientes</h2>
              <button className="text-sm text-pm-red font-semibold hover:underline">Ver todas</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nº Reserva</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Servicio</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {RESERVAS_MOCK.map(r => (
                    <ReservaCard key={r.numero} reserva={r} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
