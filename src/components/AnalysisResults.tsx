'use client'

import type { RentalAnalysis, RentalCalculations, CapRateAnalysis, VacancyImpact } from '@/types/rental'

interface AnalysisResultsProps {
  analysis: RentalAnalysis
  calculations: RentalCalculations
  capRateAnalysis: CapRateAnalysis
  vacancyImpact: VacancyImpact
}

export default function AnalysisResults({ 
  analysis, 
  calculations, 
  capRateAnalysis, 
  vacancyImpact 
}: AnalysisResultsProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getCapRateColor = (capRate: number) => {
    if (capRate >= 6) return 'text-success-600'
    if (capRate >= 4) return 'text-warning-600'
    return 'text-error-600'
  }

  const getCapRateDescription = (comparison: string) => {
    switch (comparison) {
      case 'above': return 'Por encima del promedio del mercado'
      case 'below': return 'Por debajo del promedio del mercado'
      default: return 'Dentro del promedio del mercado'
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen de la Propiedad */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Resumen de la Propiedad</h3>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Dirección</p>
              <p className="font-medium">{analysis.property.address}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Valor de la propiedad</p>
              <p className="font-medium">
                {analysis.property.value_uf 
                  ? `${analysis.property.value_uf.toLocaleString()} UF` 
                  : formatCurrency(analysis.property.value_clp)
                }
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Metros Cuadrados</p>
              <p className="font-medium">{analysis.property.size_m2} m²</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Precio Inicial Sugerido</p>
              <p className="font-medium text-primary-600">
                {formatCurrency(analysis.recommended_initial_rent)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className={`metric-value ${getCapRateColor(calculations.cap_rate)}`}>
            {calculations.cap_rate.toFixed(2)}%
          </div>
          <div className="metric-label">CAP Rate</div>
          <p className="text-xs text-gray-500 mt-2">
            {getCapRateDescription(capRateAnalysis.comparison_to_market)}
          </p>
        </div>

        <div className="metric-card">
          <div className="metric-value text-primary-600">
            {calculations.annual_rental_yield.toFixed(2)}%
          </div>
          <div className="metric-label">Rentabilidad Anual</div>
          <p className="text-xs text-gray-500 mt-2">
            Retorno bruto anual sobre inversión
          </p>
        </div>

        <div className="metric-card">
          <div className="metric-value text-success-600">
            {formatCurrency(calculations.monthly_net_income)}
          </div>
          <div className="metric-label">Ingreso Neto Mensual</div>
          <p className="text-xs text-gray-500 mt-2">
            Después de gastos operacionales
          </p>
        </div>

        <div className="metric-card">
          <div className="metric-value text-warning-600">
            {calculations.break_even_rent_reduction.toFixed(1)}%
          </div>
          <div className="metric-label">Reducción Máxima</div>
          <p className="text-xs text-gray-500 mt-2">
            Para evitar 1 mes de vacancia
          </p>
        </div>
      </div>

      {/* Análisis de CAP Rate Detallado */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h4 className="font-medium">Análisis de CAP Rate</h4>
          </div>
          <div className="card-body space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Valor de la Propiedad:</span>
              <span className="font-medium">{formatCurrency(capRateAnalysis.property_value_clp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ingreso Anual Bruto:</span>
              <span className="font-medium">{formatCurrency(capRateAnalysis.annual_rental_income)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gastos Operacionales:</span>
              <span className="font-medium text-error-600">
                -{formatCurrency(capRateAnalysis.annual_expenses)}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>NOI (Ingreso Operativo Neto):</span>
                <span className="text-success-600">
                  {formatCurrency(capRateAnalysis.net_operating_income)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4 className="font-medium">Impacto de Vacancia</h4>
          </div>
          <div className="card-body space-y-3">
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                <span className="font-medium text-warning-900">Costo de Vacancia</span>
              </div>
              <p className="text-sm text-warning-700">
                Perder 1 mes de arriendo = <strong>{vacancyImpact.percentage_annual_loss.toFixed(1)}%</strong> de pérdida anual
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Pérdida por mes vacante:</span>
                <span className="font-medium text-error-600">
                  {formatCurrency(vacancyImpact.lost_income_clp)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reducción máxima viable:</span>
                <span className="font-medium">
                  {vacancyImpact.break_even_reduction_percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
              <p className="text-sm text-primary-700">
                <strong>Estrategia:</strong> Es mejor reducir el precio hasta {vacancyImpact.break_even_reduction_percentage.toFixed(0)}% 
                que tener la propiedad vacante por un mes completo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estudio de Mercado */}
      <div className="card">
        <div className="card-header">
          <h4 className="font-medium">Estudio de Mercado</h4>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Precio por Metro Cuadrado</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Promedio de mercado:</span>
                  <span className="font-medium">
                    ${analysis.market_study.average_rent_per_m2.toLocaleString()}/m²
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio de la propiedad:</span>
                  <span className="font-medium text-primary-600">
                    ${Math.round(analysis.recommended_initial_rent / (analysis.property.size_m2 || 1)).toLocaleString()}/m²
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Rango de Mercado</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mínimo:</span>
                  <span className="font-medium">
                    {formatCurrency(analysis.market_study.market_range.min_rent_clp)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Máximo:</span>
                  <span className="font-medium">
                    {formatCurrency(analysis.market_study.market_range.max_rent_clp)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Factores del Sector</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ubicación:</span>
                  <span className="font-medium">
                    {analysis.market_study.neighborhood_factors.location_score}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transporte:</span>
                  <span className="font-medium">
                    {analysis.market_study.neighborhood_factors.transportation_access}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Servicios:</span>
                  <span className="font-medium">
                    {analysis.market_study.neighborhood_factors.amenities_score}/10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}