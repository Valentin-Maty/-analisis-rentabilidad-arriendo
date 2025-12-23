'use client'

import { UseFormReturn } from 'react-hook-form'
import { useState } from 'react'
import type { RentalAnalysisForm } from '@/types/rental'
import { SavedAnalysisFormData, formDataToSavedAnalysis } from '@/types/saved-analysis'
import { useRouter } from 'next/navigation'
import PropitalSync from './PropitalSync'
import { transformToFormData, type PropitalProperty } from '@/lib/propitalIntegration'
import { toast } from '@/components/ui/Toast'
// import { useConfirm } from '@/components/ui/Modal' // Comentado para evitar conflicto con confirm global
import HelpButton from '@/components/ui/HelpButton'
import ProgressBar from '@/components/ui/ProgressBar'
import LiveFeedback from '@/components/ui/LiveFeedback'
import SmartInput from '@/components/ui/SmartInput'

interface PropertyFormImprovedProps {
  form: UseFormReturn<RentalAnalysisForm>
  formValues: RentalAnalysisForm
  onSuggestRent: () => void
}

export default function PropertyFormImproved({ form, formValues, onSuggestRent }: PropertyFormImprovedProps) {
  const { register, formState: { errors }, watch, setValue } = form
  const [activeSection, setActiveSection] = useState(1)
  const [sending, setSending] = useState(false)
  const [showUF, setShowUF] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [analysisTitle, setAnalysisTitle] = useState('')
  const ufValue = parseFloat(formValues.uf_value_clp || '38000')
  const router = useRouter()
  const { confirm, ConfirmModalComponent } = useConfirm()

  const sections = [
    { id: 1, title: 'Información de la Propiedad', icon: '🏠' },
    { id: 2, title: 'Precio de Arriendo', icon: '💰' }
  ]

  const hasErrors = (sectionId: number) => {
    switch (sectionId) {
      case 1:
        return !!(errors.property_address || errors.property_value_clp || errors.property_value_uf || errors.property_size_m2)
      case 2:
        return formValues.rent_currency === 'CLP' ? !!(errors.suggested_rent_clp) : !!(errors.suggested_rent_uf)
      default:
        return false
    }
  }

  const isComplete = (sectionId: number) => {
    switch (sectionId) {
      case 1:
        return !!(formValues.property_address && 
                 (formValues.property_value_clp || formValues.property_value_uf) && 
                 formValues.property_size_m2)
      case 2:
        if (formValues.rent_currency === 'CLP') {
          return !!(formValues.suggested_rent_clp && parseFloat(formValues.suggested_rent_clp) > 0)
        } else {
          return !!(formValues.suggested_rent_uf && parseFloat(formValues.suggested_rent_uf) > 0)
        }
      default:
        return false
    }
  }

  // Función para guardar el análisis
  const saveAnalysis = async () => {
    if (!analysisTitle.trim()) {
      toast.warning('Título requerido', 'Por favor ingresa un título para el análisis')
      return
    }

    setSaving(true)
    try {
      const savedAnalysisData: SavedAnalysisFormData = {
        title: analysisTitle.trim(),
        property_address: formValues.property_address,
        property_value_clp: formValues.property_value_clp,
        property_value_uf: formValues.property_value_uf,
        property_size_m2: formValues.property_size_m2,
        bedrooms: formValues.bedrooms,
        bathrooms: formValues.bathrooms,
        parking_spaces: formValues.parking_spaces,
        storage_units: formValues.storage_units,
        suggested_rent_clp: formValues.suggested_rent_clp,
        suggested_rent_uf: formValues.suggested_rent_uf,
        rent_currency: formValues.rent_currency,
        capture_price_clp: formValues.capture_price_clp,
        capture_price_uf: formValues.capture_price_uf,
        capture_price_currency: formValues.capture_price_currency,
        comparable_1_address: formValues.comparable_1_address,
        comparable_1_m2: formValues.comparable_1_m2,
        comparable_1_bedrooms: formValues.comparable_1_bedrooms,
        comparable_1_bathrooms: formValues.comparable_1_bathrooms,
        comparable_1_parking: formValues.comparable_1_parking,
        comparable_1_storage: formValues.comparable_1_storage,
        comparable_1_price: formValues.comparable_1_price,
        comparable_2_address: formValues.comparable_2_address,
        comparable_2_m2: formValues.comparable_2_m2,
        comparable_2_bedrooms: formValues.comparable_2_bedrooms,
        comparable_2_bathrooms: formValues.comparable_2_bathrooms,
        comparable_2_parking: formValues.comparable_2_parking,
        comparable_2_storage: formValues.comparable_2_storage,
        comparable_2_price: formValues.comparable_2_price,
        comparable_3_address: formValues.comparable_3_address,
        comparable_3_m2: formValues.comparable_3_m2,
        comparable_3_bedrooms: formValues.comparable_3_bedrooms,
        comparable_3_bathrooms: formValues.comparable_3_bathrooms,
        comparable_3_parking: formValues.comparable_3_parking,
        comparable_3_storage: formValues.comparable_3_storage,
        comparable_3_price: formValues.comparable_3_price,
        annual_maintenance_clp: formValues.annual_maintenance_clp || '0',
        annual_property_tax_clp: formValues.annual_property_tax_clp || '0',
        annual_insurance_clp: formValues.annual_insurance_clp || '0',
        uf_value_clp: formValues.uf_value_clp,
        broker_email: 'corredor@ejemplo.com', // En una app real, esto vendría del usuario autenticado
        notes: `Análisis creado desde el formulario el ${new Date().toLocaleString('es-CL')}`,
        tags: ['formulario', 'nuevo']
      }

      const response = await fetch('/api/analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(savedAnalysisData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('¡Éxito!', 'Análisis guardado exitosamente')
        setShowSaveDialog(false)
        setAnalysisTitle('')
        
        // Preguntar si quiere ir a la lista de análisis
        if (confirm('¿Quieres ir a la lista de análisis guardados?')) {
          router.push('/analyses')
        }
      } else {
        toast.error('Error al guardar', result.error || 'Error desconocido')
      }
    } catch (error) {
      console.error('Error saving analysis:', error)
      toast.error('Error de conexión', 'No se pudo guardar el análisis. Intente nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  const canSaveAnalysis = () => {
    return !!(formValues.property_address && 
             (formValues.property_value_clp || formValues.property_value_uf) && 
             formValues.property_size_m2)
  }

  const handlePropitalPropertySelect = (property: PropitalProperty) => {
    const formData = transformToFormData(property)
    
    // Cargar datos de la propiedad en el formulario
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        setValue(key as keyof RentalAnalysisForm, value)
      }
    })
    
    toast.success('Propiedad cargada', `Datos importados desde Propital: ${property.address}`)
  }

  return (
    <div className="space-y-6">
      {/* Barra de progreso */}
      <ProgressBar 
        currentStep={activeSection}
        totalSteps={2}
        completedSteps={[1, 2].filter(step => isComplete(step))}
      />
      {/* Retroalimentación en tiempo real */}
      <LiveFeedback 
        formValues={formValues}
        currentSection={activeSection}
      />
      
      {/* Navegación por pestañas */}
      <div className="card">
        <div className="card-body p-0">
          <div className="grid grid-cols-2 gap-0">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`
                  p-6 text-center transition-all duration-300 relative
                  ${activeSection === section.id 
                    ? 'bg-blue-700 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }
                  ${section.id === 1 ? 'rounded-tl-2xl rounded-bl-2xl' : 'rounded-tr-2xl rounded-br-2xl'}
                  border-r-2 border-gray-100 last:border-r-0
                `}
              >
                <div className="text-3xl mb-3">{section.icon}</div>
                <div className="text-base font-semibold leading-tight">{section.title}</div>
                
                {/* Indicador de estado */}
                {isComplete(section.id) && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                )}
                
                {hasErrors(section.id) && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido de las secciones */}
      <div className="card min-h-[500px]">
        <div className="card-body">
          {activeSection === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-6 py-2 mb-4">
                  <span className="text-green-600 text-sm font-medium">📊 Paso 1 de 2</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">🏠 Cuéntenos sobre su Propiedad</h3>
                <p className="text-lg text-gray-600 mb-4">Necesitamos conocer algunos datos básicos de su casa o departamento para calcular cuánto puede ganar</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2 text-blue-800">
                      <span className="text-lg">⏱️</span>
                      <span className="text-sm font-medium">Solo 3 minutos</span>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2 text-green-800">
                      <span className="text-lg">🆓</span>
                      <span className="text-sm font-medium">100% gratis</span>
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2 text-purple-800">
                      <span className="text-lg">🔒</span>
                      <span className="text-sm font-medium">Datos seguros</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integración con Propital */}
              <PropitalSync 
                onPropertySelect={handlePropitalPropertySelect}
                brokerId="broker-default"
              />

              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="label">📍 ¿Dónde está ubicada su propiedad? *</label>
                    <HelpButton 
                      title="¿Por qué necesitamos la dirección?"
                      content="La dirección nos ayuda a analizar su sector y encontrar propiedades similares para calcular el mejor precio de arriendo. Esto hace que nuestro cálculo sea más preciso y le dé mejores resultados."
                    />
                  </div>
                  <p id="address-help" className="text-sm text-gray-600 mb-2">Escriba la dirección completa para que podamos analizar el sector</p>
                  <div className="relative">
                    <input
                      {...register('property_address', { required: 'Por favor escriba la dirección de su propiedad' })}
                      type="text"
                      className={`input pr-10 transition-colors ${
                        errors.property_address ? 'border-red-500 bg-red-50' : 
                        formValues.property_address ? 'border-green-500 bg-green-50' : 
                        ''
                      }`}
                      placeholder="Ejemplo: Av. Providencia 1234, Las Condes, Santiago"
                      aria-label="Dirección de la propiedad"
                      aria-required="true"
                      aria-invalid={errors.property_address ? 'true' : 'false'}
                      aria-describedby="address-help address-status"
                    />
                    {formValues.property_address && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {!errors.property_address ? (
                          <span className="text-green-500 font-bold">✓</span>
                        ) : (
                          <span className="text-red-500 font-bold">⚠️</span>
                        )}
                      </div>
                    )}
                  </div>
                  {formValues.property_address && !errors.property_address && (
                    <div id="address-status" className="flex items-center space-x-2 mt-1">
                      <span className="text-green-500 text-sm" aria-hidden="true">✓</span>
                      <span className="text-green-600 text-xs">¡Perfecto! Dirección registrada correctamente</span>
                    </div>
                  )}
                  {errors.property_address && (
                    <div id="address-status" className="flex items-center space-x-2 mt-1" role="alert">
                      <span className="text-red-500 text-sm" aria-hidden="true">⚠️</span>
                      <span className="text-red-600 text-xs">{errors.property_address.message}</span>
                    </div>
                  )}
                  
                  {/* Mapa */}
                  {formValues.property_address && (
                    <div className="mt-2 border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
                      <iframe
                        width="100%"
                        height="200"
                        frameBorder="0"
                        style={{ border: 0, borderRadius: '8px' }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=-70.65,-33.45,-70.55,-33.40&layer=mapnik&marker=-33.425,-70.60`}
                        allowFullScreen
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        📍 {formValues.property_address} - 
                        <a 
                          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(formValues.property_address + ', Chile')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline ml-1"
                        >
                          Ver en mapa completo
                        </a>
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    {!showUF ? (
                      <>
                        <label className="label">💵 Valor Peso *</label>
                        <div className="relative">
                          <input
                            {...register('property_value_clp', { 
                              required: 'El valor en pesos es requerido',
                              min: { value: 1000000, message: 'El valor debe ser mayor a $1.000.000' },
                              max: { value: 50000000000, message: 'El valor parece demasiado alto' }
                            })}
                            type="number"
                            className={`input pr-16 transition-colors ${
                              errors.property_value_clp ? 'border-red-500 bg-red-50' : 
                              formValues.property_value_clp && parseFloat(formValues.property_value_clp) >= 1000000 ? 'border-green-500 bg-green-50' : 
                              ''
                            }`}
                            placeholder="Ejemplo: 95000000 (sin puntos ni comas)"
                            aria-label="Valor de la propiedad en pesos chilenos"
                            aria-required="true"
                            aria-invalid={errors.property_value_clp ? 'true' : 'false'}
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">CLP</span>
                        </div>
                        {formValues.property_value_clp && !errors.property_value_clp && (
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-green-500 text-sm">✓</span>
                            <span className="text-green-600 text-xs">¡Excelente! Valor registrado correctamente</span>
                          </div>
                        )}
                        {errors.property_value_clp && (
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-red-500 text-sm">⚠️</span>
                            <span className="text-red-600 text-xs">{errors.property_value_clp.message}</span>
                          </div>
                        )}
                        <div className="mt-1 flex items-center space-x-2">
                          <button 
                            type="button" 
                            className="text-xs text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              const clpValue = parseFloat(formValues.property_value_clp || '0')
                              const ufCalculated = clpValue / ufValue
                              setValue('property_value_uf', ufCalculated.toFixed(2))
                              setShowUF(true)
                            }}
                          >
                            🔄 Cambiar a UF
                          </button>
                          <span className="text-xs text-gray-500">
                            (≈ {(parseFloat(formValues.property_value_clp || '0') / ufValue).toFixed(1)} UF)
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="label">💎 Valor UF *</label>
                        <div className="relative">
                          <input
                            {...register('property_value_uf')}
                            type="number"
                            step="0.01"
                            className={`input`}
                            placeholder="2500"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">UF</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2">
                          <button 
                            type="button" 
                            className="text-xs text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              const ufValueProp = parseFloat(formValues.property_value_uf || '0')
                              const clpCalculated = ufValueProp * ufValue
                              setValue('property_value_clp', clpCalculated.toFixed(0))
                              setShowUF(false)
                            }}
                          >
                            🔄 Cambiar a Pesos
                          </button>
                          <span className="text-xs text-gray-500">
                            (≈ ${(parseFloat(formValues.property_value_uf || '0') * ufValue).toLocaleString('es-CL')} CLP)
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="label">📐 ¿Qué tamaño tiene su casa/departamento? *</label>
                    <p className="text-sm text-gray-600 mb-2">Los metros cuadrados útiles (sin contar terrazas o balcones)</p>
                    <div className="relative">
                      <input
                        {...register('property_size_m2', { 
                          required: 'Los metros cuadrados son requeridos',
                          min: { value: 10, message: 'El tamaño debe ser mayor a 10 m²' },
                          max: { value: 10000, message: 'El tamaño parece demasiado grande' }
                        })}
                        type="number"
                        className={`input pr-12 transition-colors ${
                          errors.property_size_m2 ? 'border-red-500 bg-red-50' : 
                          formValues.property_size_m2 && parseFloat(formValues.property_size_m2) >= 10 ? 'border-green-500 bg-green-50' : 
                          ''
                        }`}
                        aria-label="Metros cuadrados de la propiedad"
                        aria-required="true"
                        aria-invalid={errors.property_size_m2 ? 'true' : 'false'}
                        placeholder="Ejemplo: 75"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">m²</span>
                    </div>
                    {formValues.property_size_m2 && !errors.property_size_m2 && (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-green-500 text-sm">✓</span>
                        <span className="text-green-600 text-xs">¡Perfecto! Tamaño registrado correctamente</span>
                      </div>
                    )}
                    {errors.property_size_m2 && (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-red-500 text-sm">⚠️</span>
                        <span className="text-red-600 text-xs">{errors.property_size_m2.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="label">🛏️ ¿Cuántas piezas para dormir tiene?</label>
                    <p className="text-sm text-gray-600 mb-2">Solo cuente las habitaciones con cama</p>
                    <select {...register('bedrooms')} className="input">
                      <option value="1">1 pieza (monoambiente o 1D)</option>
                      <option value="2">2 piezas (2 dormitorios)</option>
                      <option value="3">3 piezas (3 dormitorios)</option>
                      <option value="4">4 o más piezas</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">🚿 ¿Cuántos baños tiene?</label>
                    <p className="text-sm text-gray-600 mb-2">Incluya baños completos y medios baños</p>
                    <select {...register('bathrooms')} className="input">
                      <option value="1">1 baño</option>
                      <option value="2">2 baños</option>
                      <option value="3">3 baños</option>
                      <option value="4">4 o más baños</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                  <div className="w-full">
                    <label className="label">🚗 Estacionamientos</label>
                    <input
                      {...register('parking_spaces')}
                      type="number"
                      min="0"
                      defaultValue="0"
                      className="input w-full"
                      placeholder="Cantidad de estacionamientos"
                    />
                    <p className="text-xs text-gray-500 mt-1">Número de estacionamientos incluidos</p>
                  </div>

                  <div className="w-full">
                    <label className="label">📦 Bodegas</label>
                    <input
                      {...register('storage_units')}
                      type="number"
                      min="0"
                      defaultValue="0"
                      className="input w-full"
                      placeholder="Cantidad de bodegas"
                    />
                    <p className="text-xs text-gray-500 mt-1">Número de bodegas incluidas</p>
                  </div>
                </div>
                
                {/* Campo valor UF actual */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-blue-900">💱 Valor UF Hoy</label>
                      <p className="text-xs text-blue-700">Actualiza el valor para cálculos precisos</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">$</span>
                      <input
                        {...register('uf_value_clp')}
                        type="number"
                        className="input input-sm w-24"
                        placeholder="38000"
                      />
                      <span className="text-sm text-gray-600">CLP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    !canSaveAnalysis() ? 
                    'bg-gray-300 text-gray-600 cursor-not-allowed' :
                    'bg-green-500 text-white hover:bg-green-600 shadow-md'
                  }`}
                  disabled={!canSaveAnalysis()}
                >
                  <div className="flex items-center space-x-2">
                    <span>💾</span>
                    <span>Guardar</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection(2)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    !isComplete(1) ? 
                    'bg-gray-300 text-gray-600 cursor-not-allowed' :
                    'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                  }`}
                  disabled={!isComplete(1)}
                >
                  <div className="flex items-center space-x-2">
                    <span>💰</span>
                    <span>Siguiente: Calcular Precio</span>
                    <span>→</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeSection === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-6 py-2 mb-4">
                  <span className="text-purple-600 text-sm font-medium">💰 Paso 2 de 2</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">💰 ¿Cuánto Cobrar de Arriendo?</h3>
                <p className="text-lg text-gray-600 mb-4">Le ayudamos a encontrar el precio perfecto para ganar más dinero y arrendar rápido</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 text-green-800">
                      <span className="text-xl">✨</span>
                      <span className="text-sm font-medium">Análisis automático de miles de propiedades</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 text-blue-800">
                      <span className="text-xl">📊</span>
                      <span className="text-sm font-medium">Precio optimizado para su sector</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Propiedades Similares */}
                <div className="space-y-4">
                  <label className="label">🏘️ ¿Conoce propiedades parecidas en su sector? (Opcional)</label>
                  <p className="text-sm text-gray-600 mb-3">Si sabe de casas o departamentos similares que se arriendan cerca, agréguelas aquí para un cálculo más preciso</p>
                  
                  {/* Propiedad 1 */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-sm mb-3">1️⃣ Propiedad Comparable 1</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        {...register('comparable_1_address')}
                        placeholder="Dirección"
                        className="input input-sm"
                      />
                      <input
                        {...register('comparable_1_m2')}
                        type="number"
                        placeholder="Metros cuadrados"
                        className="input input-sm"
                      />
                      <input
                        {...register('comparable_1_price')}
                        type="number"
                        placeholder="Precio arriendo CLP"
                        className="input input-sm"
                      />
                      <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-4 sm:gap-2">
                        <div>
                          <label className="text-xs text-gray-600 block sm:hidden">Dormitorios</label>
                          <input
                            {...register('comparable_1_bedrooms')}
                            type="number"
                            min="0"
                            defaultValue="1"
                            placeholder="Dormitorios"
                            className="input input-sm w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block sm:hidden">Baños</label>
                          <input
                            {...register('comparable_1_bathrooms')}
                            type="number"
                            min="0"
                            defaultValue="1"
                            placeholder="Baños"
                            className="input input-sm w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block sm:hidden">Estacionamientos</label>
                          <input
                            {...register('comparable_1_parking')}
                            type="number"
                            min="0"
                            defaultValue="0"
                            placeholder="Estacionamientos"
                            className="input input-sm w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block sm:hidden">Bodegas</label>
                          <input
                            {...register('comparable_1_storage')}
                            type="number"
                            min="0"
                            defaultValue="0"
                            placeholder="Bodegas"
                            className="input input-sm w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Propiedad 2 */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-sm mb-3">2️⃣ Propiedad Comparable 2</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        {...register('comparable_2_address')}
                        placeholder="Dirección"
                        className="input input-sm"
                      />
                      <input
                        {...register('comparable_2_m2')}
                        type="number"
                        placeholder="Metros cuadrados"
                        className="input input-sm"
                      />
                      <input
                        {...register('comparable_2_price')}
                        type="number"
                        placeholder="Precio arriendo CLP"
                        className="input input-sm"
                      />
                      <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-4 sm:gap-2">
                        <div>
                          <label className="text-xs text-gray-600 block sm:hidden">Dormitorios</label>
                          <input
                            {...register('comparable_2_bedrooms')}
                            type="number"
                            min="0"
                            defaultValue="1"
                            placeholder="Dormitorios"
                            className="input input-sm w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block sm:hidden">Baños</label>
                          <input
                            {...register('comparable_2_bathrooms')}
                            type="number"
                            min="0"
                            defaultValue="1"
                            placeholder="Baños"
                            className="input input-sm w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block sm:hidden">Estacionamientos</label>
                          <input
                            {...register('comparable_2_parking')}
                            type="number"
                            min="0"
                            defaultValue="0"
                            placeholder="Estacionamientos"
                            className="input input-sm w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block sm:hidden">Bodegas</label>
                          <input
                            {...register('comparable_2_storage')}
                            type="number"
                            min="0"
                            defaultValue="0"
                            placeholder="Bodegas"
                            className="input input-sm w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Propiedad 3 */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-sm mb-3">3️⃣ Propiedad Comparable 3</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        {...register('comparable_3_address')}
                        placeholder="Dirección"
                        className="input input-sm"
                      />
                      <input
                        {...register('comparable_3_m2')}
                        type="number"
                        placeholder="Metros cuadrados"
                        className="input input-sm"
                      />
                      <input
                        {...register('comparable_3_price')}
                        type="number"
                        placeholder="Precio arriendo CLP"
                        className="input input-sm"
                      />
                      <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-4 sm:gap-2">
                        <div>
                          <label className="text-xs text-gray-600 block sm:hidden">Dormitorios</label>
                          <input
                            {...register('comparable_3_bedrooms')}
                            type="number"
                            min="0"
                            defaultValue="1"
                            placeholder="Dormitorios"
                            className="input input-sm w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block sm:hidden">Baños</label>
                          <input
                            {...register('comparable_3_bathrooms')}
                            type="number"
                            min="0"
                            defaultValue="1"
                            placeholder="Baños"
                            className="input input-sm w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block sm:hidden">Estacionamientos</label>
                          <input
                            {...register('comparable_3_parking')}
                            type="number"
                            min="0"
                            defaultValue="0"
                            placeholder="Estacionamientos"
                            className="input input-sm w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block sm:hidden">Bodegas</label>
                          <input
                            {...register('comparable_3_storage')}
                            type="number"
                            min="0"
                            defaultValue="0"
                            placeholder="Bodegas"
                            className="input input-sm w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    📋 Puedes dejar en blanco cualquier propiedad comparable que no necesites
                  </p>
                </div>

                <div>
                  <div className="mb-4">
                    <label className="label">💵 Precio Sugerido de Arriendo *</label>
                    
                    {/* Explicación clara del botón */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-600 text-xl">📊</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-2">¿Cómo calcular el precio ideal?</h4>
                          <p className="text-sm text-blue-800 mb-3">
                            Nuestro sistema analiza propiedades similares en tu zona y calcula automáticamente 
                            el precio de arriendo que te generará más ingresos.
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-xs text-blue-700 space-y-1">
                              <div>• Usa datos reales del mercado</div>
                              <div>• Considera el tamaño y ubicación</div>
                              <div>• Optimiza para arrendar rápido</div>
                            </div>
                            <button
                              type="button"
                              onClick={onSuggestRent}
                              className={`text-sm px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                                !formValues.property_size_m2 ? 
                                'bg-gray-300 text-gray-600 cursor-not-allowed' :
                                'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg'
                              }`}
                              disabled={!formValues.property_size_m2}
                            >
                              {!formValues.property_size_m2 ? (
                                <div className="flex items-center space-x-2">
                                  <span>⚠️</span>
                                  <span>Ingresa los m² primero</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <span>📊</span>
                                  <span>Calcular Precio Ideal</span>
                                  <span>✨</span>
                                </div>
                              )}
                            </button>
                          </div>
                          {!formValues.property_size_m2 && (
                            <div className="mt-2 text-xs text-orange-700 bg-orange-50 rounded p-2">
                              ⚠️ Para calcular el precio ideal necesitamos saber los metros cuadrados de tu propiedad
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Toggle de Moneda */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Moneda:</span>
                      <div className="flex space-x-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            {...register('rent_currency')}
                            type="radio"
                            value="CLP"
                            className="text-blue-600"
                          />
                          <span className="text-sm font-medium">💵 CLP (Pesos)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            {...register('rent_currency')}
                            type="radio"
                            value="UF"
                            className="text-blue-600"
                          />
                          <span className="text-sm font-medium">💎 UF</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Campo de precio CLP */}
                  {formValues.rent_currency === 'CLP' && (
                    <div>
                      <label className="label">💵 Precio en Pesos Chilenos (CLP) *</label>
                      <div className="relative">
                        <input
                          {...register('suggested_rent_clp', { 
                            required: formValues.rent_currency === 'CLP' ? 'El precio en CLP es requerido' : false 
                          })}
                          type="number"
                          className={`input ${errors.suggested_rent_clp ? 'input-error' : ''}`}
                          placeholder="500000 (sin puntos)"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">CLP</span>
                      </div>
                      {errors.suggested_rent_clp && (
                        <p className="error-text">{errors.suggested_rent_clp.message}</p>
                      )}
                    </div>
                  )}

                  {/* Campo de precio UF */}
                  {formValues.rent_currency === 'UF' && (
                    <div>
                      <label className="label">💎 Precio en Unidades de Fomento (UF) *</label>
                      <div className="relative">
                        <input
                          {...register('suggested_rent_uf', { 
                            required: formValues.rent_currency === 'UF' ? 'El precio en UF es requerido' : false 
                          })}
                          type="number"
                          step="0.01"
                          className={`input ${errors.suggested_rent_uf ? 'input-error' : ''}`}
                          placeholder="13.5 (ejemplo: 13 coma 5)"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">UF</span>
                      </div>
                      {errors.suggested_rent_uf && (
                        <p className="error-text">{errors.suggested_rent_uf.message}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        💱 Equivale aproximadamente a ${Math.round(parseFloat(formValues.suggested_rent_uf || '0') * parseFloat(formValues.uf_value_clp || '38000')).toLocaleString('es-CL')} CLP
                      </p>
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 text-sm">💡</span>
                      <div className="text-xs text-green-800">
                        <div className="font-medium mb-1">Importante:</div>
                        <div>• Este precio será la base para crear los 3 planes comerciales (A, B y C)</div>
                        <div>• Puedes ajustarlo manualmente si conoces mejor el mercado</div>
                        <div>• Un precio bien calculado significa arrendar más rápido y ganar más dinero</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Precio de Captación de la Propiedad */}
                <div className="bg-purple-50 rounded-lg p-4 space-y-3 mt-4">
                  <h3 className="text-lg font-semibold text-purple-900">📋 Precio de Captación de la Propiedad</h3>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setValue('capture_price_currency', 'CLP')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        formValues.capture_price_currency === 'CLP'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      💵 Pesos (CLP)
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('capture_price_currency', 'UF')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        formValues.capture_price_currency === 'UF'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      💎 UF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (formValues.rent_currency === 'CLP') {
                          setValue('capture_price_clp', formValues.suggested_rent_clp)
                          setValue('capture_price_currency', 'CLP')
                        } else {
                          setValue('capture_price_uf', formValues.suggested_rent_uf)
                          setValue('capture_price_currency', 'UF')
                        }
                      }}
                      className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-all"
                    >
                      🔄 Usar precio sugerido
                    </button>
                  </div>

                  {/* Campo de precio de captación CLP */}
                  {formValues.capture_price_currency === 'CLP' && (
                    <div>
                      <label className="label">💵 Precio de Captación en Pesos Chilenos (CLP)</label>
                      <div className="relative">
                        <input
                          {...register('capture_price_clp')}
                          type="number"
                          className="input"
                          placeholder="500000 (sin puntos)"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">CLP</span>
                      </div>
                    </div>
                  )}

                  {/* Campo de precio de captación UF */}
                  {formValues.capture_price_currency === 'UF' && (
                    <div>
                      <label className="label">💎 Precio de Captación en Unidades de Fomento (UF)</label>
                      <div className="relative">
                        <input
                          {...register('capture_price_uf')}
                          type="number"
                          step="0.01"
                          className="input"
                          placeholder="13.5 (ejemplo: 13 coma 5)"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">UF</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        💱 Equivale aproximadamente a ${Math.round(parseFloat(formValues.capture_price_uf || '0') * parseFloat(formValues.uf_value_clp || '38000')).toLocaleString('es-CL')} CLP
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mt-1">
                    💡 Precio con el cual el propietario captó o espera captar la propiedad para arriendo
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveSection(1)}
                  className="btn btn-secondary"
                >
                  ← Datos Básicos
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveDialog(true)}
                    className="btn btn-success"
                    disabled={!canSaveAnalysis()}
                  >
                    💾 Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">📊 Plan Comercial</h3>
                <p className="text-gray-600">Configura la estrategia de precio para maximizar la rentabilidad de tu inversión</p>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
                <div className="text-3xl mb-4">✅</div>
                <h4 className="font-bold text-yellow-800 text-lg mb-3">Planes Configurados</h4>
                <div className="text-sm text-yellow-700 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-bold text-green-700 mb-1">📊 Plan A - Premium</div>
                      <div className="text-xs text-gray-600">
                        • Días 1-7: Precio inicial<br/>
                        • Día 7: -0.27% rentabilidad<br/>
                        • Día 14: -0.53% rentabilidad<br/>
                        • Día 21: -0.80% rentabilidad<br/>
                        • Día 30: -1.08% rentabilidad<br/>
                        • Máximo: -1.83% al mes
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-bold text-orange-700 mb-1">📊 Plan B - Estándar</div>
                      <div className="text-xs text-gray-600">
                        • Días 1-10: Precio inicial<br/>
                        • Día 15: -0.46% rentabilidad<br/>
                        • Día 22: -0.91% rentabilidad<br/>
                        • Día 30: -1.37% rentabilidad<br/>
                        • Máximo: -1.83% al mes
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-bold text-blue-700 mb-1">📊 Plan C - Básico</div>
                      <div className="text-xs text-gray-600">
                        • Días 1-15: Precio inicial<br/>
                        • Día 20: -0.61% rentabilidad<br/>
                        • Día 30: -1.22% rentabilidad<br/>
                        • Máximo: -1.83% al mes
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-yellow-600 mt-3 italic">
                  Los planes están optimizados para equilibrar velocidad de arriendo vs. rentabilidad total.
                  El cliente pierde máximo 1.83% de rentabilidad anual por mes de vacancia.
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-600">📋</span>
                  <h4 className="font-medium text-green-800">Información sobre los Planes</h4>
                </div>
                <ul className="text-sm text-green-700 space-y-1 ml-6">
                  <li>• Los planes están diseñados según análisis de mercado</li>
                  <li>• Cada plan garantiza días al precio inicial para permitir visitas</li>
                  <li>• Los ajustes se basan en la pérdida de rentabilidad mensual</li>
                  <li>• El cliente puede aceptar uno o varios planes según su preferencia</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">📧 Enviar al Cliente</h4>
                    <p className="text-xs text-blue-600">Se generará un PDF para firma y aceptación</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary text-sm"
                    disabled={sending}
                    onClick={async () => {
                      setSending(true)
                      try {
                        const response = await fetch('/api/send-to-client', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            property: {
                              address: formValues.property_address,
                              value_clp: parseFloat(formValues.property_value_clp || '0'),
                              size_m2: parseFloat(formValues.property_size_m2 || '0')
                            },
                            plans: [
                              { id: 'A', initial_rent_clp: parseFloat(formValues.suggested_rent_clp || '0') },
                              { id: 'B', initial_rent_clp: parseFloat(formValues.suggested_rent_clp || '0') * 0.95 },
                              { id: 'C', initial_rent_clp: parseFloat(formValues.suggested_rent_clp || '0') * 0.97 }
                            ],
                            clientEmail: 'cliente@ejemplo.com',
                            brokerEmail: 'corredor@ejemplo.com'
                          })
                        })
                        
                        const result = await response.json()
                        if (result.success) {
                          toast.success('Enviado', 'Propuesta enviada exitosamente al cliente')
                        } else {
                          toast.error('Error', 'No se pudo enviar la propuesta')
                        }
                      } catch (error) {
                        alert('❌ Error al enviar la propuesta')
                      } finally {
                        setSending(false)
                      }
                    }}
                  >
                    {sending ? '⏳ Enviando...' : '📨 Enviar Propuesta'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveSection(2)}
                  className="btn btn-secondary"
                >
                  ← Análisis de Precio
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveDialog(true)}
                    className="btn btn-success"
                    disabled={!canSaveAnalysis()}
                  >
                    💾 Guardar Análisis
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection(1)}
                    className="btn btn-primary"
                  >
                    ✅ Completar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para guardar análisis */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">💾</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Guardar Análisis</h3>
              <p className="text-gray-600 text-sm">Dale un nombre a tu análisis para encontrarlo fácilmente</p>
            </div>

            <div className="mb-6">
              <label className="label">✏️ Título del análisis *</label>
              <input
                type="text"
                value={analysisTitle}
                onChange={(e) => setAnalysisTitle(e.target.value)}
                className="input w-full"
                placeholder={`Análisis - ${formValues.property_address?.slice(0, 30) || 'Nueva Propiedad'}...`}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                Ejemplo: "Departamento Las Condes - Av. Providencia" o "Casa Providencia - Análisis Marzo"
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <h4 className="font-semibold text-gray-900 mb-2">🏠 Resumen del análisis:</h4>
              <div className="space-y-1 text-gray-600">
                <div>📍 {formValues.property_address || 'Sin dirección'}</div>
                <div>💰 Valor: ${parseFloat(formValues.property_value_clp || '0').toLocaleString('es-CL')} CLP</div>
                <div>📐 {formValues.property_size_m2 || '0'}m² • {formValues.bedrooms || '0'}D/{formValues.bathrooms || '0'}B</div>
                {formValues.suggested_rent_clp && (
                  <div>🏠 Arriendo sugerido: ${parseFloat(formValues.suggested_rent_clp).toLocaleString('es-CL')} CLP</div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowSaveDialog(false)
                  setAnalysisTitle('')
                }}
                className="btn btn-secondary flex-1"
                disabled={saving}
              >
                ❌ Cancelar
              </button>
              <button
                type="button"
                onClick={saveAnalysis}
                className="btn btn-success flex-1"
                disabled={saving || !analysisTitle.trim()}
              >
                {saving ? '⏳ Guardando...' : '💾 Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmModalComponent />
    </div>
  )
}