'use client'

import { UseFormReturn } from 'react-hook-form'
import { useState } from 'react'
import type { RentalAnalysisForm } from '@/types/rental'
import { SavedAnalysisFormData, formDataToSavedAnalysis } from '@/types/saved-analysis'
import { useRouter } from 'next/navigation'
import PropitalSync from './PropitalSync'
import { transformToFormData, type PropitalProperty } from '@/lib/propitalIntegration'

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

  const sections = [
    { id: 1, title: '🏠 Información de la Propiedad', icon: '🏠' },
    { id: 2, title: '📊 Análisis y Plan Comercial', icon: '📊' }
  ]

  const hasErrors = (sectionId: number) => {
    switch (sectionId) {
      case 1:
        return !!(errors.property_address || errors.property_value_uf || errors.property_size_m2)
      case 2:
        return formValues.rent_currency === 'CLP' ? !!(errors.suggested_rent_clp) : !!(errors.suggested_rent_uf)
      default:
        return false
    }
  }

  const isComplete = (sectionId: number) => {
    switch (sectionId) {
      case 1:
        return !!(formValues.property_address && formValues.property_value_uf && formValues.property_size_m2)
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
      alert('Por favor ingresa un título para el análisis')
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
        alert('✅ Análisis guardado exitosamente')
        setShowSaveDialog(false)
        setAnalysisTitle('')
        
        // Preguntar si quiere ir a la lista de análisis
        if (confirm('¿Quieres ir a la lista de análisis guardados?')) {
          router.push('/analyses')
        }
      } else {
        alert(`❌ Error al guardar: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving analysis:', error)
      alert('❌ Error al guardar el análisis')
    } finally {
      setSaving(false)
    }
  }

  const canSaveAnalysis = () => {
    return !!(formValues.property_address && formValues.property_value_clp && formValues.property_size_m2)
  }

  const handlePropitalPropertySelect = (property: PropitalProperty) => {
    const formData = transformToFormData(property)
    
    // Cargar datos de la propiedad en el formulario
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        setValue(key as keyof RentalAnalysisForm, value)
      }
    })
    
    alert(`✅ Propiedad cargada desde Propital: ${property.address}`)
  }

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas */}
      <div className="card">
        <div className="card-body p-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`
                  p-4 text-center transition-all duration-300 relative
                  ${activeSection === section.id 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }
                  ${section.id === 1 ? 'rounded-tl-2xl' : ''}
                  ${section.id === sections.length ? 'rounded-tr-2xl' : ''}
                `}
              >
                <div className="text-2xl mb-2">{section.icon}</div>
                <div className="text-sm font-semibold">{section.title}</div>
                
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
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">🏠 Información de la Propiedad</h3>
                <p className="text-gray-600">Datos básicos para el análisis de rentabilidad</p>
              </div>

              {/* Integración con Propital */}
              <PropitalSync 
                onPropertySelect={handlePropitalPropertySelect}
                brokerId="broker-default"
              />

              <div className="space-y-4">
                <div>
                  <label className="label">📍 Dirección Completa *</label>
                  <input
                    {...register('property_address', { required: 'La dirección es requerida' })}
                    type="text"
                    className={`input ${errors.property_address ? 'input-error' : ''}`}
                    placeholder="Ej: Av. Providencia 123, Las Condes, Santiago"
                  />
                  {errors.property_address && (
                    <p className="error-text">{errors.property_address.message}</p>
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
                            {...register('property_value_clp', { required: 'El valor es requerido' })}
                            type="number"
                            className={`input ${errors.property_value_clp ? 'input-error' : ''}`}
                            placeholder="95000000"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">CLP</span>
                        </div>
                        {errors.property_value_clp && (
                          <p className="error-text">{errors.property_value_clp.message}</p>
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
                    <label className="label">📐 Metros Cuadrados *</label>
                    <div className="relative">
                      <input
                        {...register('property_size_m2', { required: 'Los m² son requeridos' })}
                        type="number"
                        className={`input ${errors.property_size_m2 ? 'input-error' : ''}`}
                        placeholder="75"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">m²</span>
                    </div>
                    {errors.property_size_m2 && (
                      <p className="error-text">{errors.property_size_m2.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="label">🛏️ Dormitorios</label>
                    <select {...register('bedrooms')} className="input">
                      <option value="1">1 Dormitorio</option>
                      <option value="2">2 Dormitorios</option>
                      <option value="3">3 Dormitorios</option>
                      <option value="4">4+ Dormitorios</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">🚿 Baños</label>
                    <select {...register('bathrooms')} className="input">
                      <option value="1">1 Baño</option>
                      <option value="2">2 Baños</option>
                      <option value="3">3 Baños</option>
                      <option value="4">4+ Baños</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="label">🚗 Estacionamientos</label>
                    <input
                      {...register('parking_spaces')}
                      type="number"
                      min="0"
                      defaultValue="0"
                      className="input"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="label">📦 Bodegas</label>
                    <input
                      {...register('storage_units')}
                      type="number"
                      min="0"
                      defaultValue="0"
                      className="input"
                      placeholder="0"
                    />
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
                  className="btn btn-success"
                  disabled={!canSaveAnalysis()}
                >
                  💾 Guardar Análisis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection(2)}
                  className="btn btn-primary"
                  disabled={!isComplete(1)}
                >
                  Siguiente: Análisis y Plan Comercial →
                </button>
              </div>
            </div>
          )}

          {activeSection === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">💰 Análisis de Precio de Mercado</h3>
                <p className="text-gray-600">Compara con propiedades similares y determina precio óptimo</p>
              </div>

              <div className="space-y-4">
                {/* Propiedades Similares */}
                <div className="space-y-4">
                  <label className="label">🏘️ Propiedades Similares:</label>
                  
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
                      <div className="grid grid-cols-4 gap-1">
                        <input
                          {...register('comparable_1_bedrooms')}
                          type="number"
                          min="0"
                          defaultValue="1"
                          placeholder="Dorm"
                          className="input input-sm"
                        />
                        <input
                          {...register('comparable_1_bathrooms')}
                          type="number"
                          min="0"
                          defaultValue="1"
                          placeholder="Baños"
                          className="input input-sm"
                        />
                        <input
                          {...register('comparable_1_parking')}
                          type="number"
                          min="0"
                          defaultValue="0"
                          placeholder="Est"
                          className="input input-sm"
                        />
                        <input
                          {...register('comparable_1_storage')}
                          type="number"
                          min="0"
                          defaultValue="0"
                          placeholder="Bod"
                          className="input input-sm"
                        />
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
                      <div className="grid grid-cols-4 gap-1">
                        <input
                          {...register('comparable_2_bedrooms')}
                          type="number"
                          min="0"
                          defaultValue="1"
                          placeholder="Dorm"
                          className="input input-sm"
                        />
                        <input
                          {...register('comparable_2_bathrooms')}
                          type="number"
                          min="0"
                          defaultValue="1"
                          placeholder="Baños"
                          className="input input-sm"
                        />
                        <input
                          {...register('comparable_2_parking')}
                          type="number"
                          min="0"
                          defaultValue="0"
                          placeholder="Est"
                          className="input input-sm"
                        />
                        <input
                          {...register('comparable_2_storage')}
                          type="number"
                          min="0"
                          defaultValue="0"
                          placeholder="Bod"
                          className="input input-sm"
                        />
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
                      <div className="grid grid-cols-4 gap-1">
                        <input
                          {...register('comparable_3_bedrooms')}
                          type="number"
                          min="0"
                          defaultValue="1"
                          placeholder="Dorm"
                          className="input input-sm"
                        />
                        <input
                          {...register('comparable_3_bathrooms')}
                          type="number"
                          min="0"
                          defaultValue="1"
                          placeholder="Baños"
                          className="input input-sm"
                        />
                        <input
                          {...register('comparable_3_parking')}
                          type="number"
                          min="0"
                          defaultValue="0"
                          placeholder="Est"
                          className="input input-sm"
                        />
                        <input
                          {...register('comparable_3_storage')}
                          type="number"
                          min="0"
                          defaultValue="0"
                          placeholder="Bod"
                          className="input input-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    📋 Puedes dejar en blanco cualquier propiedad comparable que no necesites
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="label">💵 Precio Sugerido de Arriendo *</label>
                    <button
                      type="button"
                      onClick={onSuggestRent}
                      className="btn btn-secondary text-xs py-2 px-3"
                      disabled={!formValues.property_size_m2}
                    >
                      ✨ Sugerir Precio
                    </button>
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
                        💱 Equivale aproximadamente a ${Math.round(parseFloat(formValues.suggested_rent_uf || '0') * parseFloat(formValues.uf_value_clp || '38000')).toLocaleString()} CLP
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mt-1">
                    💡 Este precio será la base para los planes A, B y C
                  </p>
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
                        💱 Equivale aproximadamente a ${Math.round(parseFloat(formValues.capture_price_uf || '0') * parseFloat(formValues.uf_value_clp || '38000')).toLocaleString()} CLP
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
                  <button
                    type="button"
                    onClick={() => setActiveSection(3)}
                    className="btn btn-primary"
                    disabled={!isComplete(2)}
                  >
                    Siguiente: Configuración →
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
                          alert('✅ Propuesta enviada exitosamente al cliente')
                        } else {
                          alert('❌ Error al enviar la propuesta')
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
    </div>
  )
}