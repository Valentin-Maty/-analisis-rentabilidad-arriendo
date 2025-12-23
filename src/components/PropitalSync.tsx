'use client'

import { useState, useEffect } from 'react'
import { 
  getBrokerProperties, 
  getBrokerInfo, 
  syncWithPropital, 
  isPropitalIntegrationEnabled,
  transformToFormData,
  type PropitalProperty,
  type PropitalBroker 
} from '@/lib/propitalIntegration'

interface PropitalSyncProps {
  onPropertySelect?: (property: PropitalProperty) => void
  onSyncComplete?: () => void
  brokerId?: string
}

export default function PropitalSync({ 
  onPropertySelect, 
  onSyncComplete,
  brokerId = 'broker-default' 
}: PropitalSyncProps) {
  const [properties, setProperties] = useState<PropitalProperty[]>([])
  const [broker, setBroker] = useState<PropitalBroker | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    setIsEnabled(isPropitalIntegrationEnabled())
    if (isEnabled) {
      loadInitialData()
    }
  }, [isEnabled])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [propertiesData, brokerData] = await Promise.all([
        getBrokerProperties(brokerId),
        getBrokerInfo(brokerId)
      ])
      
      setProperties(propertiesData)
      setBroker(brokerData)
    } catch (error) {
      console.error('Error loading Propital data:', error)
      setError(error instanceof Error ? error.message : 'Error cargando datos de Propital')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    
    try {
      const syncResult = await syncWithPropital(brokerId)
      setProperties(syncResult.properties)
      setLastSync(syncResult.lastSync)
      
      if (onSyncComplete) {
        onSyncComplete()
      }
      
      // Mostrar mensaje de éxito
      alert(`✅ Sincronización exitosa!\n📊 ${syncResult.properties.length} propiedades sincronizadas\n🕐 ${syncResult.lastSync.toLocaleString('es-CL')}`)
      
    } catch (error) {
      console.error('Error syncing with Propital:', error)
      setError(error instanceof Error ? error.message : 'Error sincronizando con Propital')
    } finally {
      setSyncing(false)
    }
  }

  const handlePropertySelect = (property: PropitalProperty) => {
    if (onPropertySelect) {
      onPropertySelect(property)
    }
  }

  if (!isEnabled) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-yellow-800">Integración con Propital Deshabilitada</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Para usar esta funcionalidad, configure las variables de entorno necesarias y habilite la integración.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-blue-800 font-medium">Conectando con Propital...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con información del broker */}
      {broker && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {broker.profile_image && (
                <img 
                  src={broker.profile_image} 
                  alt={broker.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-bold text-purple-900">🏢 {broker.company}</h3>
                <p className="text-sm text-purple-700">{broker.name} • {broker.email}</p>
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                syncing 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {syncing ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Sincronizando...</span>
                </span>
              ) : (
                '🔄 Sincronizar'
              )}
            </button>
          </div>
          
          {lastSync && (
            <div className="mt-2 text-xs text-purple-600">
              Última sincronización: {lastSync.toLocaleString('es-CL')}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 text-xl">❌</span>
            <div>
              <h4 className="font-bold text-red-800">Error de Conexión</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de propiedades */}
      {properties.length > 0 && (
        <div className="bg-white border-2 border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center">
              🏠 Propiedades de Propital ({properties.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Seleccione una propiedad para cargar sus datos automáticamente
            </p>
          </div>
          
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {properties.map(property => (
              <div 
                key={property.id}
                className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                onClick={() => handlePropertySelect(property)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{property.address}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mt-2">
                      <div>💎 {property.value_uf ? `${property.value_uf} UF` : `$${property.value_clp.toLocaleString()}`}</div>
                      <div>📐 {property.size_m2}m²</div>
                      <div>🛏️ {property.bedrooms} dorm</div>
                      <div>🚿 {property.bathrooms} baños</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      property.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : property.status === 'rented'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {property.status === 'published' ? '🟢 Publicada' : 
                       property.status === 'rented' ? '🔵 Arrendada' : 
                       property.status === 'draft' ? '🟡 Borrador' : '⚪ Archivada'}
                    </span>
                    <span className="text-blue-600 hover:text-blue-800">
                      📥 Cargar
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {properties.length === 0 && !loading && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-3">🏠</div>
          <h3 className="font-bold text-gray-700 mb-2">No hay propiedades disponibles</h3>
          <p className="text-sm text-gray-600 mb-4">
            No se encontraron propiedades en Propital para este corredor.
          </p>
          <button
            onClick={handleSync}
            className="btn btn-primary"
            disabled={syncing}
          >
            🔄 Sincronizar con Propital
          </button>
        </div>
      )}
    </div>
  )
}