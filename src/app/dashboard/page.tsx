'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnalysisStorage, type DashboardData, type DashboardActivity } from '@/lib/localStorage'
import { SavedAnalysis } from '@/types/saved-analysis'

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'recent' | 'active' | 'draft'>('all')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    setLoading(true)
    try {
      // Cargar datos del dashboard desde localStorage
      const data = AnalysisStorage.getDashboardData()
      const allAnalyses = AnalysisStorage.getAll()
      
      setDashboardData(data)
      setAnalyses(allAnalyses)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: SavedAnalysis['metadata']['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent_to_client': return 'bg-blue-100 text-blue-800'
      case 'client_responded': return 'bg-yellow-100 text-yellow-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: SavedAnalysis['metadata']['status']) => {
    switch (status) {
      case 'draft': return 'Borrador'
      case 'sent_to_client': return 'Enviado'
      case 'client_responded': return 'Respondido'
      case 'published': return 'Publicado'
      case 'archived': return 'Archivado'
      default: return status
    }
  }

  const getActivityIcon = (type: DashboardActivity['type']) => {
    switch (type) {
      case 'analysis_created': return '📝'
      case 'rental_sent': return '📨'
      case 'client_response': return '💬'
      case 'price_updated': return '💰'
      default: return '📊'
    }
  }

  const filteredAnalyses = analyses.filter(analysis => {
    if (filter === 'all') return true
    if (filter === 'recent') {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return new Date(analysis.metadata.created_at) > dayAgo
    }
    if (filter === 'active') return ['sent_to_client', 'published', 'client_responded'].includes(analysis.metadata.status)
    if (filter === 'draft') return analysis.metadata.status === 'draft'
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">⏳ Cargando dashboard...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
            <p className="text-gray-600 mt-1">Resumen de tu actividad de análisis de rentabilidad</p>
          </div>
          <Link 
            href="/analisis-precio" 
            className="btn btn-primary flex items-center space-x-2"
          >
            <span>🧮</span>
            <span>Calculadora de Arriendo</span>
          </Link>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-3xl font-bold text-blue-600">{dashboardData?.totalAnalyses || 0}</div>
              <div className="text-gray-600 text-sm mt-1">Total Análisis</div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body text-center">
              <div className="text-3xl font-bold text-green-600">{dashboardData?.activeRentals || 0}</div>
              <div className="text-gray-600 text-sm mt-1">Arriendos Activos</div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body text-center">
              <div className="text-3xl font-bold text-purple-600">
                {dashboardData?.averageRentability ? `${dashboardData.averageRentability.toFixed(1)}%` : '0%'}
              </div>
              <div className="text-gray-600 text-sm mt-1">Rentabilidad Promedio</div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body text-center">
              <div className="text-3xl font-bold text-orange-600">
                {analyses.filter(a => a.metadata.status === 'draft').length}
              </div>
              <div className="text-gray-600 text-sm mt-1">Borradores</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card">
          <div className="card-body">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="font-medium text-gray-900">Filtrar análisis:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Todos ({analyses.length})
                </button>
                <button
                  onClick={() => setFilter('recent')}
                  className={`btn ${filter === 'recent' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Recientes ({analyses.filter(a => {
                    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                    return new Date(a.metadata.created_at) > dayAgo
                  }).length})
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Activos ({dashboardData?.activeRentals || 0})
                </button>
                <button
                  onClick={() => setFilter('draft')}
                  className={`btn ${filter === 'draft' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Borradores ({analyses.filter(a => a.metadata.status === 'draft').length})
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de análisis */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Análisis Recientes</h2>
            
            {filteredAnalyses.length === 0 ? (
              <div className="card">
                <div className="card-body text-center py-12">
                  <div className="text-6xl mb-4">📂</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay análisis</h3>
                  <p className="text-gray-600 mb-6">
                    {filter === 'all' 
                      ? 'Aún no has creado ningún análisis de rentabilidad.' 
                      : `No hay análisis en la categoría "${filter}".`
                    }
                  </p>
                  <Link href="/analisis-precio" className="btn btn-primary">
                    🧮 Crear Primer Análisis
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAnalyses.slice(0, 5).map((analysis) => (
                  <div key={analysis.id} className="card hover:shadow-lg transition-shadow">
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                            {analysis.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            📍 {analysis.property.address}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.metadata.status)}`}>
                          {getStatusLabel(analysis.metadata.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">💰 Valor:</span>
                          <div className="font-medium">{formatCurrency(analysis.property.value_clp)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">🏠 Arriendo:</span>
                          <div className="font-medium text-green-600">
                            {formatCurrency(analysis.analysis.suggested_rent_clp || 0)}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          {formatDate(analysis.metadata.updated_at)}
                        </span>
                        <Link 
                          href={`/analisis-precio?id=${analysis.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          👁️ Ver
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAnalyses.length > 5 && (
                  <div className="text-center">
                    <Link href="/analyses" className="btn btn-secondary">
                      Ver todos los análisis ({filteredAnalyses.length})
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actividad reciente */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Actividad Reciente</h2>
            
            {!dashboardData?.recentActivity || dashboardData.recentActivity.length === 0 ? (
              <div className="card">
                <div className="card-body text-center py-12">
                  <div className="text-4xl mb-4">📈</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin actividad reciente</h3>
                  <p className="text-gray-600">La actividad aparecerá aquí cuando realices acciones.</p>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="space-y-3">
                    {dashboardData.recentActivity.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                          {activity.property_address && (
                            <p className="text-xs text-gray-500 mt-1">📍 {activity.property_address}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{formatDate(activity.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/analisis-precio" 
                className="btn btn-primary flex items-center justify-center space-x-2 p-4"
              >
                <span>🧮</span>
                <span>Nuevo Análisis</span>
              </Link>
              
              <Link 
                href="/analyses" 
                className="btn btn-secondary flex items-center justify-center space-x-2 p-4"
              >
                <span>📂</span>
                <span>Ver Todos los Análisis</span>
              </Link>
              
              <button 
                onClick={loadDashboardData}
                className="btn btn-secondary flex items-center justify-center space-x-2 p-4"
              >
                <span>🔄</span>
                <span>Actualizar Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}