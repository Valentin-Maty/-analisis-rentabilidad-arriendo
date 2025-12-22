'use client'

import type { RentalAnalysis, RentalCalculations, CapRateAnalysis, VacancyImpact } from '@/types/rental'

interface AnalysisResultsImprovedProps {
  analysis: RentalAnalysis
  calculations: RentalCalculations
  capRateAnalysis: CapRateAnalysis
  vacancyImpact: VacancyImpact
  rentCurrency?: 'CLP' | 'UF'
  rentValueUF?: number
}

export default function AnalysisResultsImproved({ 
  analysis, 
  calculations, 
  capRateAnalysis, 
  vacancyImpact,
  rentCurrency = 'CLP',
  rentValueUF
}: AnalysisResultsImprovedProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getCapRateColor = (capRate: number) => {
    if (capRate >= 6) return 'text-green-600'
    if (capRate >= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  const getCapRateIcon = (capRate: number) => {
    if (capRate >= 6) return '🟢'
    if (capRate >= 4) return '🟡'
    return '🔴'
  }

  const getCapRateDescription = (comparison: string) => {
    switch (comparison) {
      case 'above': return 'Por encima del promedio del mercado'
      case 'below': return 'Por debajo del promedio del mercado'
      default: return 'Dentro del promedio del mercado'
    }
  }

  return (
    <div className="space-y-8">
      {/* Resumen Ejecutivo */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-2xl font-bold text-white">🏠 Resumen Ejecutivo</h3>
          <p className="text-blue-100">Información clave de la propiedad</p>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100">
              <div className="text-3xl mb-2">📍</div>
              <div className="text-sm text-gray-600 mb-1">Dirección</div>
              <div className="font-bold text-gray-900 text-sm">{analysis.property.address}</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-100">
              <div className="text-3xl mb-2">💎</div>
              <div className="text-sm text-gray-600 mb-1">Valor de la propiedad</div>
              <div className="font-bold text-gray-900 text-lg">
                {analysis.property.value_uf 
                  ? `${analysis.property.value_uf.toLocaleString()} UF` 
                  : formatCurrency(analysis.property.value_clp)
                }
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
              <div className="text-3xl mb-2">📐</div>
              <div className="text-sm text-gray-600 mb-1">Superficie</div>
              <div className="font-bold text-gray-900 text-lg">{analysis.property.size_m2} m²</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-100">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-sm text-gray-600 mb-1">Precio Inicial</div>
              <div className="font-bold text-primary-600 text-lg">
                {rentCurrency === 'UF' && rentValueUF ? (
                  <>
                    <div>{rentValueUF} UF</div>
                    <div className="text-sm text-gray-500">{formatCurrency(analysis.recommended_initial_rent)}</div>
                  </>
                ) : (
                  formatCurrency(analysis.recommended_initial_rent)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">📊 Indicadores Clave de Rentabilidad</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="metric-card group">
            <div className="flex items-center justify-between mb-4">
              <div className={`text-4xl ${getCapRateColor(calculations.cap_rate)} metric-value`}>
                {calculations.cap_rate.toFixed(2)}%
              </div>
              <div className="text-3xl">{getCapRateIcon(calculations.cap_rate)}</div>
            </div>
            <div className="metric-label">CAP Rate</div>
            <div className="text-xs opacity-75 mt-2">
              {getCapRateDescription(capRateAnalysis.comparison_to_market)}
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <div className="metric-value text-blue-200">
                {calculations.annual_rental_yield.toFixed(2)}%
              </div>
              <div className="text-3xl">📈</div>
            </div>
            <div className="metric-label">Rentabilidad Bruta Anual</div>
            <div className="text-xs opacity-75 mt-2">
              Retorno bruto sobre inversión
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <div className="metric-value text-green-200">
                {formatCurrency(calculations.monthly_net_income)}
              </div>
              <div className="text-3xl">💵</div>
            </div>
            <div className="metric-label">Ingreso Neto Mensual</div>
            <div className="text-xs opacity-75 mt-2">
              Después de gastos operacionales
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <div className="metric-value text-orange-200">
                {calculations.break_even_rent_reduction.toFixed(1)}%
              </div>
              <div className="text-3xl">⚖️</div>
            </div>
            <div className="metric-label">Reducción Máxima Viable</div>
            <div className="text-xs opacity-75 mt-2">
              Para evitar 1 mes de vacancia
            </div>
          </div>
        </div>
      </div>

      {/* Análisis de CAP Rate vs Impacto de Vacancia */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* CAP Rate Detallado */}
        <div className="card">
          <div className="card-header">
            <h4 className="text-xl font-bold text-white flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Análisis de CAP Rate
            </h4>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 font-medium">Valor de la Propiedad:</span>
                  <span className="font-bold text-lg">{formatCurrency(capRateAnalysis.property_value_clp)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-gray-700 font-medium">Ingreso Anual Bruto:</span>
                  <span className="font-bold text-green-600">{formatCurrency(capRateAnalysis.annual_rental_income)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-gray-700 font-medium">Gastos Operacionales:</span>
                  <span className="font-bold text-red-600">
                    -{formatCurrency(capRateAnalysis.annual_expenses)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
                  <span className="text-gray-900 font-bold text-lg">NOI (Ingreso Neto):</span>
                  <span className="font-bold text-xl text-green-700">
                    {formatCurrency(capRateAnalysis.net_operating_income)}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getCapRateColor(calculations.cap_rate)}`}>
                    {calculations.cap_rate.toFixed(2)}%
                  </div>
                  <div className="text-sm font-medium text-gray-700">CAP Rate Final</div>
                  <div className="text-xs text-gray-600 mt-2">
                    {getCapRateDescription(capRateAnalysis.comparison_to_market)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impacto de Vacancia */}
        <div className="card">
          <div className="card-header">
            <h4 className="text-xl font-bold text-white flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              Impacto de Vacancia
            </h4>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🚨</div>
                <div className="text-2xl font-bold text-red-700 mb-2">
                  {vacancyImpact.percentage_annual_loss.toFixed(1)}%
                </div>
                <div className="text-sm text-red-600 font-medium">
                  Pérdida por cada mes vacante
                </div>
                <div className="text-xs text-red-500 mt-2">
                  1 mes sin arriendo = {vacancyImpact.percentage_annual_loss.toFixed(1)}% menos rentabilidad anual
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-center">
                  <div className="text-2xl font-bold text-orange-700">
                    {formatCurrency(vacancyImpact.lost_income_clp)}
                  </div>
                  <div className="text-sm text-orange-600">Pérdida Mensual</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {vacancyImpact.break_even_reduction_percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-600">Reducción Máxima</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <div className="font-bold text-blue-800 mb-1">Estrategia Recomendada</div>
                    <div className="text-sm text-blue-700">
                      Es mejor reducir el precio hasta un {vacancyImpact.break_even_reduction_percentage.toFixed(0)}% 
                      que mantener la propiedad vacante por un mes completo.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estudio de Mercado Mejorado */}
      <div className="card">
        <div className="card-header">
          <h4 className="text-xl font-bold text-white flex items-center">
            <span className="text-2xl mr-2">🏘️</span>
            Estudio de Mercado
          </h4>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h5 className="font-bold text-gray-900 mb-4 flex items-center justify-center">
                <span className="text-xl mr-2">📊</span>
                Precio por Metro Cuadrado
              </h5>
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Promedio de mercado</div>
                  <div className="text-2xl font-bold text-blue-700">
                    ${analysis.market_study.average_rent_per_m2.toLocaleString()}/m²
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Esta propiedad</div>
                  <div className="text-2xl font-bold text-purple-700">
                    ${Math.round(analysis.recommended_initial_rent / (analysis.property.size_m2 || 1)).toLocaleString()}/m²
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h5 className="font-bold text-gray-900 mb-4 flex items-center justify-center">
                <span className="text-xl mr-2">🎯</span>
                Rango de Mercado
              </h5>
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Mínimo</div>
                  <div className="text-xl font-bold text-green-700">
                    {formatCurrency(analysis.market_study.market_range.min_rent_clp)}
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <div className="text-sm text-gray-600 mb-1">Máximo</div>
                  <div className="text-xl font-bold text-red-700">
                    {formatCurrency(analysis.market_study.market_range.max_rent_clp)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h5 className="font-bold text-gray-900 mb-4 flex items-center justify-center">
                <span className="text-xl mr-2">⭐</span>
                Factores del Sector
              </h5>
              <div className="space-y-3">
                {[
                  { label: 'Ubicación', score: analysis.market_study.neighborhood_factors.location_score, icon: '📍' },
                  { label: 'Transporte', score: analysis.market_study.neighborhood_factors.transportation_access, icon: '🚌' },
                  { label: 'Servicios', score: analysis.market_study.neighborhood_factors.amenities_score, icon: '🏪' }
                ].map((factor, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <span className="mr-2">{factor.icon}</span>
                        {factor.label}
                      </span>
                      <div className="flex items-center">
                        <div className="text-lg font-bold text-gray-900">
                          {factor.score}/10
                        </div>
                        <div className="ml-2 flex">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full mr-1 ${
                                i < factor.score ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Términos y Condiciones */}
      <div className="card">
        <div className="card-header">
          <h4 className="text-xl font-bold text-white flex items-center">
            <span className="text-2xl mr-2">📋</span>
            Términos y Condiciones de Exclusividad
          </h4>
        </div>
        <div className="card-body">
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h5 className="font-bold text-blue-900 mb-4">📝 Condiciones del Servicio de Arriendo en Exclusiva</h5>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>El análisis de rentabilidad es válido por <strong>30 días</strong> desde la fecha de generación.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>El cliente debe aceptar al menos <strong>1 plan comercial</strong> (A, B o C) para proceder con la publicación.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Los ajustes de precio se realizan automáticamente según el cronograma del plan seleccionado.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>La propiedad se publicará una vez confirmada la aceptación del cliente vía correo electrónico.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Después de 30 días, la propiedad pasa automáticamente al plan básico, salvo que el cliente manifieste lo contrario.</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <h5 className="font-bold text-orange-900 mb-4">⚠️ Información Importante sobre Vacancia</h5>
              <div className="space-y-3 text-sm text-orange-800">
                <div className="flex items-start space-x-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>Cada mes de vacancia representa una pérdida del <strong>{vacancyImpact.percentage_annual_loss.toFixed(1)}%</strong> de la rentabilidad anual.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>Es preferible reducir el precio hasta un <strong>{calculations.break_even_rent_reduction.toFixed(1)}%</strong> antes que mantener la propiedad vacante.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>Los días necesarios para firmar contrato y gestiones están considerados en el análisis de cada plan.</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h5 className="font-bold text-green-900 mb-4">✅ Beneficios del Servicio</h5>
              <div className="space-y-3 text-sm text-green-800">
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Análisis profesional basado en datos de mercado y propiedades similares.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Estrategias diferenciadas para maximizar la velocidad de arriendo y rentabilidad.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Seguimiento continuo y ajustes automáticos según el desempeño del mercado.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Soporte directo del equipo comercial durante todo el proceso.</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-700">
                <strong>Contacto:</strong> Para consultas adicionales, puede comunicarse directamente con su corredor asignado 
                o escribirnos al WhatsApp disponible en nuestros canales de atención.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}