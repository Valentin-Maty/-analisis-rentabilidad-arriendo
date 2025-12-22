'use client'

import { useState, useEffect } from 'react'
import type { PriceAlert, RentalProposal } from '@/types/rental'

// Datos simulados (en producción vendrían de una API)
const mockAlerts: PriceAlert[] = [
  {
    id: 'alert-1',
    property_id: 'prop-123',
    current_rent: 850000,
    suggested_new_rent: 807500,
    reason: 'low_visits',
    days_since_publication: 15,
    visits_count: 2,
    applications_count: 0,
    created_at: new Date()
  },
  {
    id: 'alert-2',
    property_id: 'prop-456',
    current_rent: 950000,
    suggested_new_rent: 903000,
    reason: 'no_applications',
    days_since_publication: 20,
    visits_count: 8,
    applications_count: 0,
    created_at: new Date()
  },
  {
    id: 'alert-3',
    property_id: 'prop-789',
    current_rent: 750000,
    suggested_new_rent: 712500,
    reason: 'time_based',
    days_since_publication: 25,
    visits_count: 5,
    applications_count: 1,
    created_at: new Date()
  }
]

const mockProposals: RentalProposal[] = [
  {
    id: 'proposal-1',
    property: {
      id: 'prop-123',
      address: 'Av. Providencia 1234, Las Condes',
      value_clp: 95000000,
      value_uf: 2500,
      market_rent_clp: 850000,
      size_m2: 85,
      bedrooms: 2,
      bathrooms: 2,
      parking_spaces: 1,
      storage_units: 1
    },
    analysis: {} as any, // Simplificado para el mock
    status: 'published',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
    expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 días adelante
  },
  {
    id: 'proposal-2',
    property: {
      id: 'prop-456',
      address: 'Calle Los Leones 567, Providencia',
      value_clp: 118400000,
      value_uf: 3200,
      market_rent_clp: 950000,
      size_m2: 95,
      bedrooms: 3,
      bathrooms: 2,
      parking_spaces: 1,
      storage_units: 0
    },
    analysis: {} as any,
    status: 'published',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'proposal-3',
    property: {
      id: 'prop-789',
      address: 'Av. Apoquindo 890, Las Condes',
      value_clp: 74000000,
      value_uf: 2000,
      market_rent_clp: 750000,
      size_m2: 75,
      bedrooms: 2,
      bathrooms: 1,
      parking_spaces: 0,
      storage_units: 0
    },
    analysis: {} as any,
    status: 'published',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  }
]

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [proposals, setProposals] = useState<RentalProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'urgent' | 'moderate' | 'low'>('all')

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setAlerts(mockAlerts)
      setProposals(mockProposals)
      setLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getAlertSeverity = (alert: PriceAlert): 'urgent' | 'moderate' | 'low' => {
    if (alert.days_since_publication >= 25 || alert.visits_count <= 2) return 'urgent'
    if (alert.days_since_publication >= 15 || alert.visits_count <= 5) return 'moderate'
    return 'low'
  }

  const getAlertColor = (severity: 'urgent' | 'moderate' | 'low') => {
    switch (severity) {
      case 'urgent': return 'bg-error-50 border-error-200 text-error-800'
      case 'moderate': return 'bg-warning-50 border-warning-200 text-warning-800'
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'low_visits': return 'Pocas visitas'
      case 'no_applications': return 'Sin postulaciones'
      case 'time_based': return 'Tiempo en publicación'
      case 'market_change': return 'Cambio de mercado'
      default: return reason
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    return getAlertSeverity(alert) === filter
  })

  const handleApplyPriceReduction = (alertId: string) => {
    // En producción, esto haría una llamada a la API
    const priceAlert = alerts.find(a => a.id === alertId)
    if (priceAlert) {
      const confirmed = window.confirm(`¿Aplicar reducción de precio a ${formatCurrency(priceAlert.suggested_new_rent)}?`)
      if (confirmed) {
        // Aquí se aplicaría la reducción de precio
        handleDismissAlert(alertId)
      }
    }
  }

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Arriendos</h1>
        <p className="text-gray-600 mt-2">
          Monitoreo de propiedades publicadas y alertas de ajuste de precios
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="metric-value text-error-600">{alerts.filter(a => getAlertSeverity(a) === 'urgent').length}</div>
          <div className="metric-label">Alertas Urgentes</div>
        </div>
        <div className="metric-card">
          <div className="metric-value text-warning-600">{alerts.filter(a => getAlertSeverity(a) === 'moderate').length}</div>
          <div className="metric-label">Alertas Moderadas</div>
        </div>
        <div className="metric-card">
          <div className="metric-value text-primary-600">{proposals.filter(p => p.status === 'published').length}</div>
          <div className="metric-label">Propiedades Publicadas</div>
        </div>
        <div className="metric-card">
          <div className="metric-value text-success-600">
            {proposals.filter(p => new Date() > new Date(p.expires_at)).length}
          </div>
          <div className="metric-label">Próximas a Vencer</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-medium text-gray-900">Filtrar alertas:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Todas ({alerts.length})
              </button>
              <button
                onClick={() => setFilter('urgent')}
                className={`btn ${filter === 'urgent' ? 'bg-error-600 text-white' : 'btn-secondary'}`}
              >
                Urgentes ({alerts.filter(a => getAlertSeverity(a) === 'urgent').length})
              </button>
              <button
                onClick={() => setFilter('moderate')}
                className={`btn ${filter === 'moderate' ? 'bg-warning-600 text-white' : 'btn-secondary'}`}
              >
                Moderadas ({alerts.filter(a => getAlertSeverity(a) === 'moderate').length})
              </button>
              <button
                onClick={() => setFilter('low')}
                className={`btn ${filter === 'low' ? 'bg-blue-600 text-white' : 'btn-secondary'}`}
              >
                Información ({alerts.filter(a => getAlertSeverity(a) === 'low').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Alertas de Ajuste de Precio</h2>
        
        {filteredAlerts.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alertas</h3>
              <p className="text-gray-600">No hay alertas de ajuste de precio para mostrar en este momento.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const severity = getAlertSeverity(alert)
              const proposal = proposals.find(p => p.property.id === alert.property_id)
              
              return (
                <div key={alert.id} className={`card border-2 ${getAlertColor(severity)}`}>
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {proposal?.property.address || `Propiedad ${alert.property_id}`}
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Precio actual:</span>
                            <div className="font-medium">{formatCurrency(alert.current_rent)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Precio sugerido:</span>
                            <div className="font-medium text-primary-600">
                              {formatCurrency(alert.suggested_new_rent)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Días publicada:</span>
                            <div className="font-medium">{alert.days_since_publication} días</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Visitas:</span>
                            <div className="font-medium">{alert.visits_count} visitas</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          severity === 'urgent' ? 'bg-error-100 text-error-800' :
                          severity === 'moderate' ? 'bg-warning-100 text-warning-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {severity === 'urgent' ? 'URGENTE' : 
                           severity === 'moderate' ? 'MODERADA' : 'INFORMACIÓN'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <span className="text-gray-600">Motivo:</span>
                          <span className="ml-2 font-medium">{getReasonText(alert.reason)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Postulaciones:</span>
                          <span className="ml-2 font-medium">{alert.applications_count}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reducción:</span>
                          <span className="ml-2 font-medium">
                            -{((alert.current_rent - alert.suggested_new_rent) / alert.current_rent * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="btn btn-secondary text-sm py-2 px-4"
                        >
                          Ignorar
                        </button>
                        <button
                          onClick={() => handleApplyPriceReduction(alert.id)}
                          className="btn btn-primary text-sm py-2 px-4"
                        >
                          Aplicar Reducción
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Propiedades Publicadas */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Propiedades Publicadas</h2>
        
        <div className="card">
          <div className="card-body overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Actual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Publicada
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vence en
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proposals.map((proposal) => {
                  const daysPublished = Math.floor((Date.now() - proposal.created_at.getTime()) / (1000 * 60 * 60 * 24))
                  const daysUntilExpiry = Math.ceil((proposal.expires_at.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  const hasAlert = alerts.some(a => a.property_id === proposal.property.id)
                  
                  return (
                    <tr key={proposal.id} className={hasAlert ? 'bg-warning-50' : ''}>
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{proposal.property.address}</div>
                          <div className="text-sm text-gray-500">
                            {proposal.property.size_m2}m² • {proposal.property.bedrooms}d • {proposal.property.bathrooms}b
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        {formatCurrency(proposal.property.market_rent_clp)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {daysPublished} días
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          hasAlert ? 'bg-warning-100 text-warning-800' : 'bg-success-100 text-success-800'
                        }`}>
                          {hasAlert ? 'Con Alerta' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={daysUntilExpiry <= 5 ? 'text-error-600 font-medium' : ''}>
                          {daysUntilExpiry > 0 ? `${daysUntilExpiry} días` : 'Vencida'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <button className="btn btn-secondary text-xs py-1 px-3">
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}