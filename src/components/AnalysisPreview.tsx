'use client'

import { useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { RentalAnalysisForm } from '@/types/rental'

interface AnalysisPreviewProps {
  formValues: RentalAnalysisForm
}

interface ClientData {
  ownerName: string
  ownerRut: string
  ownerPhone: string
  ownerEmail: string
  selectedStrategies: string[]
  brokerName: string
  brokerRut: string
  brokerPhone: string
  brokerEmail: string
}

export default function AnalysisPreview({ formValues }: AnalysisPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSigned, setHasSigned] = useState(false)
  const [clientData, setClientData] = useState<ClientData>({
    ownerName: '',
    ownerRut: '',
    ownerPhone: '',
    ownerEmail: '',
    selectedStrategies: [],
    brokerName: '',
    brokerRut: '',
    brokerPhone: '',
    brokerEmail: ''
  })

  const generatePDF = async () => {
    if (!previewRef.current) return

    try {
      // Capturar el elemento como canvas
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      // Crear PDF optimizado para una sola página
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = 210
      const pageHeight = 295
      const margin = 10
      const availableWidth = pageWidth - (margin * 2)
      const availableHeight = pageHeight - (margin * 2)
      
      // Calcular dimensiones para que quepa en una página
      const imgAspectRatio = canvas.width / canvas.height
      let finalWidth = availableWidth
      let finalHeight = finalWidth / imgAspectRatio
      
      // Si es muy alto, ajustar por altura
      if (finalHeight > availableHeight) {
        finalHeight = availableHeight
        finalWidth = finalHeight * imgAspectRatio
      }
      
      // Centrar en la página
      const x = (pageWidth - finalWidth) / 2
      const y = (pageHeight - finalHeight) / 2

      // Agregar imagen ajustada a una sola página
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)

      // Guardar PDF
      pdf.save(`propuesta-arriendo-${formValues.property_address.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`)
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF')
    }
  }

  // Funciones para la firma optimizada
  const initializeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configuración optimizada para firma suave
    ctx.strokeStyle = '#1f2937' // Azul gris oscuro
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = 'source-over'
    
    // Fondo blanco limpio
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {
    initializeCanvas()
  }, [])

  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    if ('touches' in e) {
      // Touch event
      e.preventDefault() // Prevenir scroll en móvil
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    
    const pos = getEventPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    
    // Agregar un pequeño punto al inicio para mejor experiencia
    ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2)
    ctx.fill()
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getEventPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    
    if (!hasSigned) {
      setHasSigned(true)
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Volver a poner el fondo blanco
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    setHasSigned(false)
  }

  const toggleStrategy = (strategy: string) => {
    setClientData(prevData => {
      const currentStrategies = prevData.selectedStrategies
      if (currentStrategies.includes(strategy)) {
        // Remover estrategia si ya está seleccionada
        return {
          ...prevData,
          selectedStrategies: currentStrategies.filter(s => s !== strategy)
        }
      } else {
        // Agregar estrategia si no está seleccionada
        return {
          ...prevData,
          selectedStrategies: [...currentStrategies, strategy]
        }
      }
    })
  }

  const baseRent = formValues.rent_currency === 'UF' 
    ? parseFloat(formValues.suggested_rent_uf || '0') * parseFloat(formValues.uf_value_clp || '37000')
    : parseFloat(formValues.suggested_rent_clp || '0')

  return (
    <div className="space-y-6">
      {/* Vista previa del análisis */}
      <div ref={previewRef} className="bg-white p-8 rounded-xl">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 rounded-t-xl -m-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">PROPUESTA COMERCIAL</h1>
              <h2 className="text-xl text-blue-200">Gestión de Arriendo Profesional</h2>
              <p className="text-sm text-gray-300 mt-2">Análisis de Rentabilidad y Estrategia de Precios</p>
            </div>
            <div className="text-right text-sm text-gray-300">
              <p>Fecha: {new Date().toLocaleDateString('es-CL')}</p>
              <p>Propuesta N°: {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
            </div>
          </div>
        </div>

        {/* Resumen Ejecutivo */}
        <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
          <h2 className="text-xl font-bold mb-3 text-blue-900">📋 Resumen Ejecutivo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700">${baseRent.toLocaleString('es-CL')}</div>
              <div className="text-sm text-blue-600">Precio Inicial Sugerido</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">{((baseRent * 12) / (formValues.property_value_clp ? parseFloat(formValues.property_value_clp) : parseFloat(formValues.property_value_uf || '0') * 37000) * 100).toFixed(1)}%</div>
              <div className="text-sm text-green-600">Rentabilidad Anual Bruta</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700">7-30</div>
              <div className="text-sm text-purple-600">Días para Arriendo</div>
            </div>
          </div>
        </div>

        {/* Información de la Propiedad */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">🏠 Detalle de la Propiedad</h2>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Ubicación</p>
                  <p className="text-lg font-semibold text-gray-900">{formValues.property_address || 'No especificada'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Superficie Total</p>
                  <p className="text-lg font-semibold text-gray-900">{formValues.property_size_m2} m² útiles</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Valor Comercial</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formValues.property_value_clp ? (
                      `$${parseFloat(formValues.property_value_clp).toLocaleString('es-CL')} CLP`
                    ) : formValues.property_value_uf ? (
                      `${parseFloat(formValues.property_value_uf).toFixed(2)} UF`
                    ) : (
                      'No especificado'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Configuración</p>
                  <div className="flex space-x-4 text-lg font-semibold text-gray-900">
                    <span>{formValues.bedrooms} Dormitorios</span>
                    <span>•</span>
                    <span>{formValues.bathrooms} Baños</span>
                    {parseInt(formValues.parking_spaces || '0') > 0 && <><span>•</span><span>{formValues.parking_spaces} Estac.</span></>}
                    {parseInt(formValues.storage_units || '0') > 0 && <><span>•</span><span>{formValues.storage_units} Bodega</span></>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Análisis de Mercado */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">📊 Análisis de Mercado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-300 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-green-800 mb-3">💰 Precio Recomendado</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-green-700">${baseRent.toLocaleString('es-CL')}</div>
                <div className="text-sm text-green-600">CLP por mes</div>
                {formValues.rent_currency === 'UF' && (
                  <div className="text-xs text-green-500 mt-1">({formValues.suggested_rent_uf} UF)</div>
                )}
              </div>
              <div className="text-sm text-green-700">
                <p><strong>Precio por m²:</strong> ${Math.round(baseRent / parseFloat(formValues.property_size_m2 || '1')).toLocaleString('es-CL')}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-300 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-blue-800 mb-3">📈 Proyección Financiera</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Ingreso Mensual:</span>
                  <span className="font-semibold">${baseRent.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingreso Anual:</span>
                  <span className="font-semibold">${(baseRent * 12).toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>ROI Anual Bruto:</span>
                  <span className="font-bold text-blue-700">{((baseRent * 12) / (formValues.property_value_clp ? parseFloat(formValues.property_value_clp) : parseFloat(formValues.property_value_uf || '0') * 37000) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estrategias Comerciales */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">🎯 Estrategias de Arriendo</h2>
          <p className="text-gray-600 mb-6">Seleccione la estrategia que mejor se adapte a sus objetivos de rentabilidad y tiempo:</p>
          
          <div className="space-y-6">
            {/* Plan A - Velocidad Rápida */}
            <div className="border-2 border-green-400 rounded-xl p-6 bg-gradient-to-r from-green-50 to-green-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-green-800 flex items-center">
                    <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">A</span>
                    Estrategia Velocidad Rápida
                  </h3>
                  <p className="text-sm text-green-600 mt-1">Ideal para propietarios que priorizan liquidez inmediata</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">7-15 días</div>
                  <div className="text-xs text-green-600">Tiempo objetivo</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-800 mb-3">📅 Cronograma de Precios</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between bg-white bg-opacity-60 p-2 rounded">
                      <span className="font-medium">Días 1-7:</span>
                      <span className="font-bold">${baseRent.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between bg-white bg-opacity-40 p-2 rounded">
                      <span className="font-medium">Días 8-15:</span>
                      <span className="font-bold">${Math.round(baseRent * 0.975).toLocaleString('es-CL')} <span className="text-xs text-green-600">(-2.5%)</span></span>
                    </div>
                    <div className="flex justify-between bg-white bg-opacity-40 p-2 rounded">
                      <span className="font-medium">Días 16-22:</span>
                      <span className="font-bold">${Math.round(baseRent * 0.95).toLocaleString('es-CL')} <span className="text-xs text-green-600">(-5%)</span></span>
                    </div>
                    <div className="flex justify-between bg-white bg-opacity-40 p-2 rounded">
                      <span className="font-medium">Días 23-30:</span>
                      <span className="font-bold">${Math.round(baseRent * 0.925).toLocaleString('es-CL')} <span className="text-xs text-green-600">(-7.5%)</span></span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-green-800 mb-3">📊 Proyección de Ingresos</h4>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white bg-opacity-60 p-3 rounded">
                      <div className="flex justify-between">
                        <span>Ingreso promedio esperado:</span>
                        <span className="font-bold">${Math.round(baseRent * 0.975).toLocaleString('es-CL')}</span>
                      </div>
                      <div className="text-xs text-green-600 mt-1">✅ Arriendo rápido en 7-12 días = 99.6% de rentabilidad anual conservada</div>
                      <div className="text-xs text-green-700 mt-1 font-semibold">💰 Ahorro: El propietario conserva 18-23 días de renta vs. esperar 30 días</div>
                      <div className="text-xs text-green-600 mt-1">📈 Ganancia adicional: ${Math.round(baseRent * 0.975 * 0.6).toLocaleString('es-CL')} por arriendo rápido</div>
                    </div>
                    <div className="bg-white bg-opacity-60 p-3 rounded">
                      <div className="text-green-700 font-medium">✅ Ventajas:</div>
                      <ul className="text-xs mt-1 space-y-1">
                        <li>• Flujo de caja inmediato</li>
                        <li>• Menor riesgo de vacancia</li>
                        <li>• Certeza de ingreso rápido</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan B - Velocidad Media */}
            <div className="border-2 border-orange-400 rounded-xl p-6 bg-gradient-to-r from-orange-50 to-orange-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-orange-800 flex items-center">
                    <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">B</span>
                    Estrategia Equilibrio Óptimo
                  </h3>
                  <p className="text-sm text-orange-600 mt-1">Equilibrio perfecto entre precio y velocidad de arriendo</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-700">10-20 días</div>
                  <div className="text-xs text-orange-600">Tiempo objetivo</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-orange-800 mb-3">📅 Cronograma de Precios</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between bg-white bg-opacity-60 p-2 rounded">
                      <span className="font-medium">Días 1-10:</span>
                      <span className="font-bold">${baseRent.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between bg-white bg-opacity-40 p-2 rounded">
                      <span className="font-medium">Días 11-20:</span>
                      <span className="font-bold">${Math.round(baseRent * 0.97).toLocaleString('es-CL')} <span className="text-xs text-orange-600">(-3%)</span></span>
                    </div>
                    <div className="flex justify-between bg-white bg-opacity-40 p-2 rounded">
                      <span className="font-medium">Días 21-30:</span>
                      <span className="font-bold">${Math.round(baseRent * 0.94).toLocaleString('es-CL')} <span className="text-xs text-orange-600">(-6%)</span></span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-orange-800 mb-3">📊 Proyección de Ingresos</h4>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white bg-opacity-60 p-3 rounded">
                      <div className="flex justify-between">
                        <span>Ingreso promedio esperado:</span>
                        <span className="font-bold">${Math.round(baseRent * 0.97).toLocaleString('es-CL')}</span>
                      </div>
                      <div className="text-xs text-orange-600 mt-1">🌟 Arriendo en 12-15 días = 99.5% de rentabilidad anual conservada</div>
                      <div className="text-xs text-orange-700 mt-1 font-semibold">💰 Ahorro: El propietario conserva 15 días de renta vs. esperar 30 días</div>
                      <div className="text-xs text-orange-600 mt-1">📈 Ganancia adicional: ${Math.round(baseRent * 0.5).toLocaleString('es-CL')} por arriendo en medio mes</div>
                    </div>
                    <div className="bg-white bg-opacity-60 p-3 rounded">
                      <div className="text-orange-700 font-medium">⚡ Ventajas:</div>
                      <ul className="text-xs mt-1 space-y-1">
                        <li>• Mejor precio promedio</li>
                        <li>• Tiempo razonable de espera</li>
                        <li>• ROI optimizado</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan C - Velocidad Conservadora */}
            <div className="border-2 border-blue-400 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-blue-800 flex items-center">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">C</span>
                    Estrategia Máxima Rentabilidad
                  </h3>
                  <p className="text-sm text-blue-600 mt-1">Para propietarios que buscan el mejor precio del mercado</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-700">15-30 días</div>
                  <div className="text-xs text-blue-600">Tiempo objetivo</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-3">📅 Cronograma de Precios</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between bg-white bg-opacity-60 p-2 rounded">
                      <span className="font-medium">Días 1-15:</span>
                      <span className="font-bold">${baseRent.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between bg-white bg-opacity-40 p-2 rounded">
                      <span className="font-medium">Días 16-25:</span>
                      <span className="font-bold">${Math.round(baseRent * 0.985).toLocaleString('es-CL')} <span className="text-xs text-blue-600">(-1.5%)</span></span>
                    </div>
                    <div className="flex justify-between bg-white bg-opacity-40 p-2 rounded">
                      <span className="font-medium">Días 26-30:</span>
                      <span className="font-bold">${Math.round(baseRent * 0.97).toLocaleString('es-CL')} <span className="text-xs text-blue-600">(-3%)</span></span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-800 mb-3">📊 Proyección de Ingresos</h4>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white bg-opacity-60 p-3 rounded">
                      <div className="flex justify-between">
                        <span>Ingreso promedio esperado:</span>
                        <span className="font-bold">${Math.round(baseRent * 0.985).toLocaleString('es-CL')}</span>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">🔵 Arriendo en 15-20 días = 99.33% de rentabilidad anual conservada</div>
                      <div className="text-xs text-blue-700 mt-1 font-semibold">💰 Ahorro: El propietario conserva 10 días de renta vs. esperar 30 días</div>
                      <div className="text-xs text-blue-600 mt-1">📈 Ganancia adicional: ${Math.round(baseRent * 0.33).toLocaleString('es-CL')} por no extenderse a 30 días</div>
                    </div>
                    <div className="bg-white bg-opacity-60 p-3 rounded">
                      <div className="text-blue-700 font-medium">🎯 Ventajas:</div>
                      <ul className="text-xs mt-1 space-y-1">
                        <li>• Precio máximo de mercado</li>
                        <li>• Mayor rentabilidad total</li>
                        <li>• Selección de mejores inquilinos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nota importante */}
        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>📌 Lógica de Rentabilidad:</strong> Arriendo rápido = mayor rentabilidad. Cada día que se arrienda antes, conserva 0.033% adicional de rentabilidad anual. 
            El sistema maximiza la rentabilidad asegurando que nunca se pierda más del 8.33% (equivalente a 1 mes de los 12 del año). 
            Cada estrategia balancea velocidad vs precio óptimo según sus preferencias.
          </p>
        </div>

        {/* Términos y Condiciones */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4 text-gray-800">📋 Términos y Condiciones del Servicio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">✓ Servicios Incluidos:</h4>
              <ul className="space-y-1">
                <li>• Gestión completa del proceso de arriendo</li>
                <li>• Marketing profesional de la propiedad</li>
                <li>• Evaluación crediticia de candidatos</li>
                <li>• Contratos legales y documentación</li>
                <li>• Seguimiento continuo durante 30 días</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📊 Garantías del Servicio:</h4>
              <ul className="space-y-1">
                <li>• Precio optimizado según mercado actual</li>
                <li>• Ajustes automáticos según cronograma</li>
                <li>• Reportes semanales de rendimiento</li>
                <li>• Soporte profesional especializado</li>
                <li>• Transparencia total en el proceso</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Aceptación del Cliente */}
        <div className="mt-8 pt-8 border-t-2 border-slate-300">
          <h3 className="text-xl font-bold mb-6 text-gray-800">✍️ Aceptación y Autorización</h3>
          
          <div className="bg-blue-50 border border-blue-300 p-6 rounded-lg mb-6">
            <p className="text-sm text-blue-800 mb-4">
              <strong>Declaración de Aceptación:</strong> Al firmar este documento, confirmo que he revisado y acepto 
              los términos de la propuesta comercial, incluyendo la estrategia de precios seleccionada y los servicios 
              de gestión de arriendo descritos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">
                  Nombre Completo del Propietario
                </label>
                <div className="border-b-2 border-gray-400 h-10 bg-white rounded-t flex items-center px-2">
                  <input
                    type="text"
                    value={clientData.ownerName}
                    onChange={(e) => setClientData({...clientData, ownerName: e.target.value})}
                    placeholder="Escribir nombre completo"
                    className="w-full border-none outline-none bg-transparent text-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">
                  RUT
                </label>
                <div className="border-b-2 border-gray-400 h-10 bg-white rounded-t flex items-center px-2">
                  <input
                    type="text"
                    value={clientData.ownerRut}
                    onChange={(e) => setClientData({...clientData, ownerRut: e.target.value})}
                    placeholder="12.345.678-9"
                    className="w-full border-none outline-none bg-transparent text-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">
                  Teléfono de Contacto
                </label>
                <div className="border-b-2 border-gray-400 h-10 bg-white rounded-t flex items-center px-2">
                  <input
                    type="text"
                    value={clientData.ownerPhone}
                    onChange={(e) => setClientData({...clientData, ownerPhone: e.target.value})}
                    placeholder="+56 9 1234 5678"
                    className="w-full border-none outline-none bg-transparent text-gray-800"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">
                  Email
                </label>
                <div className="border-b-2 border-gray-400 h-10 bg-white rounded-t flex items-center px-2">
                  <input
                    type="email"
                    value={clientData.ownerEmail}
                    onChange={(e) => setClientData({...clientData, ownerEmail: e.target.value})}
                    placeholder="correo@email.com"
                    className="w-full border-none outline-none bg-transparent text-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">
                  Fecha de Firma
                </label>
                <div className="border-b-2 border-gray-400 h-10 bg-white rounded-t flex items-center px-2">
                  <span className="text-gray-800">{new Date().toLocaleDateString('es-CL')}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-2">
                  Firma del Propietario
                </label>
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-2 relative touch-none">
                    <canvas
                      ref={canvasRef}
                      width={450}
                      height={120}
                      className="block w-full h-full cursor-crosshair touch-none"
                      style={{ maxWidth: '100%', height: 'auto' }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    {!hasSigned && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-gray-400 text-lg">✍️</span>
                        <span className="text-gray-400 text-sm mt-1">Toque y arrastre para firmar</span>
                        <span className="text-gray-300 text-xs mt-1">Funciona con mouse o dedo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-blue-700">
                      💡 Firma con mouse, stylus o dedo
                    </div>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-xs text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded border hover:bg-red-100"
                    >
                      🗑️ Borrar y firmar de nuevo
                    </button>
                  </div>
                  {hasSigned && (
                    <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                      ✅ Firma capturada correctamente
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-300 p-6 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-3">🎯 Estrategias Seleccionadas:</h4>
            <p className="text-sm text-yellow-700 mb-4">Puede seleccionar 1, 2 o las 3 alternativas según sus preferencias</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer ${clientData.selectedStrategies.includes('A') ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                <input 
                  type="checkbox" 
                  value="A"
                  className="w-5 h-5 text-green-600 rounded" 
                  checked={clientData.selectedStrategies.includes('A')} 
                  onChange={() => toggleStrategy('A')}
                />
                <div>
                  <div className="font-semibold text-green-700">Estrategia A - Velocidad Rápida</div>
                  <div className="text-xs text-green-600">Arriendo en 7-15 días</div>
                </div>
              </label>
              <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer ${clientData.selectedStrategies.includes('B') ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                <input 
                  type="checkbox" 
                  value="B"
                  className="w-5 h-5 text-orange-600 rounded" 
                  checked={clientData.selectedStrategies.includes('B')} 
                  onChange={() => toggleStrategy('B')}
                />
                <div>
                  <div className="font-semibold text-orange-700">Estrategia B - Equilibrio Óptimo</div>
                  <div className="text-xs text-orange-600">Arriendo en 10-20 días</div>
                </div>
              </label>
              <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer ${clientData.selectedStrategies.includes('C') ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                <input 
                  type="checkbox" 
                  value="C"
                  className="w-5 h-5 text-blue-600 rounded" 
                  checked={clientData.selectedStrategies.includes('C')} 
                  onChange={() => toggleStrategy('C')}
                />
                <div>
                  <div className="font-semibold text-blue-700">Estrategia C - Máxima Rentabilidad</div>
                  <div className="text-xs text-blue-600">Arriendo en 15-30 días</div>
                </div>
              </label>
            </div>
            {clientData.selectedStrategies.length > 0 && (
              <div className="mt-4 bg-green-50 border border-green-200 p-3 rounded">
                <p className="text-sm text-green-800">
                  ✅ Estrategias seleccionadas: {clientData.selectedStrategies.join(', ')}
                </p>
              </div>
            )}
          </div>
          
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p><strong>Próximo paso:</strong> Una vez firmada esta propuesta, comenzaremos inmediatamente la gestión profesional 
            de su propiedad según la estrategia seleccionada.</p>
          </div>
        </div>
      </div>

      {/* Botón de acción */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={generatePDF}
          className="btn btn-primary"
        >
          📄 Generar PDF
        </button>
      </div>

    </div>
  )
}