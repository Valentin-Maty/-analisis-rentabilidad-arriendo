/*
Domain: Analysis Engine
Responsibility: Motor de cálculos para análisis de rentabilidad
Dependencies: Tipos de datos, cálculos financieros
*/

import type { RentalAnalysisForm, RentalAnalysis, RentalPlan, PriceAdjustmentSchedule } from '@/types/rental'

export function performAnalysis(formData: RentalAnalysisForm): RentalAnalysis {
  // Convertir valores de string a números
  const propertyValue = parseFloat(formData.property_value_clp || '0')
  const suggestedRent = parseFloat(formData.suggested_rent_clp || '0')
  const capturePrice = parseFloat(formData.capture_price_clp || formData.suggested_rent_clp || '0')
  const maintenanceCost = parseFloat(formData.annual_maintenance_clp || '0') / 12
  const propertyTax = parseFloat(formData.annual_property_tax_clp || '0') / 12
  const insurance = parseFloat(formData.annual_insurance_clp || '0') / 12
  const vacancyRate = 0.0833 // 8.33% por defecto (1 mes de vacancia al año)
  
  // Calcular gastos anuales
  const annualMaintenance = maintenanceCost * 12
  const annualPropertyTax = propertyTax * 12
  const annualInsurance = insurance * 12
  const totalAnnualExpenses = annualMaintenance + annualPropertyTax + annualInsurance
  
  // Calcular ingresos anuales considerando vacancia
  const monthlyRentIncome = suggestedRent * (1 - vacancyRate)
  const annualRentIncome = monthlyRentIncome * 12
  
  // Calcular rentabilidad
  const netAnnualIncome = annualRentIncome - totalAnnualExpenses
  const capRate = propertyValue > 0 ? (netAnnualIncome / propertyValue) * 100 : 0
  const grossYield = propertyValue > 0 ? ((suggestedRent * 12) / propertyValue) * 100 : 0
  const netYield = propertyValue > 0 ? (netAnnualIncome / propertyValue) * 100 : 0
  
  // Construir array de comparables desde los campos individuales
  const comparableProperties = []
  
  if (formData.comparable_1_price && formData.comparable_1_address) {
    comparableProperties.push({
      id: 1,
      address: formData.comparable_1_address,
      rent_clp: parseFloat(formData.comparable_1_price),
      size_m2: parseFloat(formData.comparable_1_m2 || '0'),
      bedrooms: parseInt(formData.comparable_1_bedrooms || '0'),
      bathrooms: parseInt(formData.comparable_1_bathrooms || '0'),
      parking_spaces: parseInt(formData.comparable_1_parking || '0'),
      storage_units: parseInt(formData.comparable_1_storage || '0'),
      price_per_m2: parseFloat(formData.comparable_1_m2 || '1') > 0 
        ? parseFloat(formData.comparable_1_price || '0') / parseFloat(formData.comparable_1_m2 || '1') 
        : 0,
      link: formData.comparable_1_link,
      similarity_score: 85
    })
  }
  
  if (formData.comparable_2_price && formData.comparable_2_address) {
    comparableProperties.push({
      id: 2,
      address: formData.comparable_2_address,
      rent_clp: parseFloat(formData.comparable_2_price),
      size_m2: parseFloat(formData.comparable_2_m2 || '0'),
      bedrooms: parseInt(formData.comparable_2_bedrooms || '0'),
      bathrooms: parseInt(formData.comparable_2_bathrooms || '0'),
      parking_spaces: parseInt(formData.comparable_2_parking || '0'),
      storage_units: parseInt(formData.comparable_2_storage || '0'),
      price_per_m2: parseFloat(formData.comparable_2_m2 || '1') > 0 
        ? parseFloat(formData.comparable_2_price || '0') / parseFloat(formData.comparable_2_m2 || '1') 
        : 0,
      link: formData.comparable_2_link,
      similarity_score: 85
    })
  }
  
  if (formData.comparable_3_price && formData.comparable_3_address) {
    comparableProperties.push({
      id: 3,
      address: formData.comparable_3_address,
      rent_clp: parseFloat(formData.comparable_3_price),
      size_m2: parseFloat(formData.comparable_3_m2 || '0'),
      bedrooms: parseInt(formData.comparable_3_bedrooms || '0'),
      bathrooms: parseInt(formData.comparable_3_bathrooms || '0'),
      parking_spaces: parseInt(formData.comparable_3_parking || '0'),
      storage_units: parseInt(formData.comparable_3_storage || '0'),
      price_per_m2: parseFloat(formData.comparable_3_m2 || '1') > 0 
        ? parseFloat(formData.comparable_3_price || '0') / parseFloat(formData.comparable_3_m2 || '1') 
        : 0,
      link: formData.comparable_3_link,
      similarity_score: 85
    })
  }

  // Generar planes comerciales
  const plans: RentalPlan[] = []
  
  // Siempre generar los 3 planes
  plans.push(generatePlanA(capturePrice))
  plans.push(generatePlanB(capturePrice))
  plans.push(generatePlanC(capturePrice))
  
  // Construir resultado del análisis
  const analysis: RentalAnalysis = {
    property: {
      id: `prop_${Date.now()}`,
      address: formData.property_address || '',
      value_clp: propertyValue,
      value_uf: parseFloat(formData.property_value_uf || '0'),
      market_rent_clp: suggestedRent,
      size_m2: parseFloat(formData.property_size_m2 || '0'),
      bedrooms: parseInt(formData.bedrooms || '0'),
      bathrooms: parseInt(formData.bathrooms || '0'),
      parking_spaces: parseInt(formData.parking_spaces || '0'),
      storage_units: parseInt(formData.storage_units || '0')
    },
    plans,
    market_study: {
      average_rent_per_m2: parseFloat(formData.property_size_m2 || '0') > 0 
        ? suggestedRent / parseFloat(formData.property_size_m2 || '1')
        : 0,
      comparable_properties: comparableProperties,
      market_range: {
        min_rent_clp: suggestedRent * 0.9,
        max_rent_clp: suggestedRent * 1.1
      },
      neighborhood_factors: {
        location_score: 8,
        transportation_access: 7,
        amenities_score: 8
      }
    },
    cap_rate_analysis: {
      property_value_clp: propertyValue,
      annual_rental_income: suggestedRent * 12,
      annual_expenses: totalAnnualExpenses,
      net_operating_income: netAnnualIncome,
      cap_rate_percentage: capRate,
      comparison_to_market: capRate >= 8 ? 'above' : capRate >= 6 ? 'average' : 'below'
    },
    vacancy_impact: {
      days_vacant: 30, // 1 mes promedio
      percentage_annual_loss: vacancyRate * 100,
      lost_income_clp: suggestedRent * vacancyRate * 12,
      break_even_reduction_percentage: vacancyRate * 100
    },
    recommended_initial_rent: capturePrice
  }
  
  return analysis
}

// Generar Plan A (Premium)
function generatePlanA(baseRent: number): RentalPlan {
  const schedule: PriceAdjustmentSchedule[] = [
    { day: 0, new_rent_clp: baseRent, percentage_reduction: 0 },
    { day: 15, new_rent_clp: baseRent * 0.95, percentage_reduction: 5 },
    { day: 25, new_rent_clp: baseRent * 0.92, percentage_reduction: 8 },
    { day: 30, new_rent_clp: baseRent * 0.90, percentage_reduction: 10 }
  ]
  
  return {
    id: 'A',
    name: 'Plan Premium',
    description: 'Servicio completo con marketing intensivo y ajustes flexibles para arriendo rápido',
    initial_rent_clp: baseRent,
    final_rent_clp: baseRent * 0.90,
    commission_percentage: 50,
    service_level: 'premium',
    marketing_duration_days: 30,
    price_adjustment_schedule: schedule,
    expected_rental_time_days: 15,
    success_probability_percentage: 95,
    included_services: [
      'Fotografía profesional HDR',
      'Video tour 360°',
      'Publicación en 10+ portales',
      'Gestión completa de visitas',
      'Verificación exhaustiva de arrendatarios',
      'Redacción de contrato',
      'Soporte post-arriendo 3 meses'
    ]
  }
}

// Generar Plan B (Estándar)
function generatePlanB(baseRent: number): RentalPlan {
  const schedule: PriceAdjustmentSchedule[] = [
    { day: 0, new_rent_clp: baseRent, percentage_reduction: 0 },
    { day: 20, new_rent_clp: baseRent * 0.93, percentage_reduction: 7 },
    { day: 30, new_rent_clp: baseRent * 0.88, percentage_reduction: 12 }
  ]
  
  return {
    id: 'B',
    name: 'Plan Estándar',
    description: 'Balance óptimo entre precio y servicio con ajustes moderados',
    initial_rent_clp: baseRent,
    final_rent_clp: baseRent * 0.88,
    commission_percentage: 75,
    service_level: 'standard',
    marketing_duration_days: 30,
    price_adjustment_schedule: schedule,
    expected_rental_time_days: 20,
    success_probability_percentage: 85,
    included_services: [
      'Fotografía profesional',
      'Publicación en 5+ portales',
      'Gestión de visitas coordinadas',
      'Verificación básica de arrendatarios',
      'Redacción de contrato',
      'Soporte post-arriendo 1 mes'
    ]
  }
}

// Generar Plan C (Básico)
function generatePlanC(baseRent: number): RentalPlan {
  const schedule: PriceAdjustmentSchedule[] = [
    { day: 0, new_rent_clp: baseRent, percentage_reduction: 0 },
    { day: 30, new_rent_clp: baseRent * 0.85, percentage_reduction: 15 }
  ]
  
  return {
    id: 'C',
    name: 'Plan Básico',
    description: 'Servicio económico con ajuste único al final del período',
    initial_rent_clp: baseRent,
    final_rent_clp: baseRent * 0.85,
    commission_percentage: 100,
    service_level: 'basic',
    marketing_duration_days: 30,
    price_adjustment_schedule: schedule,
    expected_rental_time_days: 30,
    success_probability_percentage: 75,
    included_services: [
      'Fotografía básica',
      'Publicación en 3 portales principales',
      'Coordinación básica de visitas',
      'Plantilla de contrato estándar'
    ]
  }
}

// Calcular CAP Rate con cambio de renta
function calculateCapRateWithRentChange(
  propertyValue: number,
  newRent: number,
  annualExpenses: number,
  vacancyRate: number
): number {
  if (propertyValue <= 0) return 0
  
  const annualIncome = newRent * 12 * (1 - vacancyRate)
  const netIncome = annualIncome - annualExpenses
  return (netIncome / propertyValue) * 100
}

// Calcular IRR aproximado (simplificado)
function calculateIRR(initialInvestment: number, annualCashFlow: number): number {
  if (initialInvestment <= 0 || annualCashFlow <= 0) return 0
  
  // Aproximación simple del IRR para 10 años
  const years = 10
  let irr = 0.1 // Comenzar con 10%
  
  for (let i = 0; i < 5; i++) {
    let npv = -initialInvestment
    for (let year = 1; year <= years; year++) {
      npv += annualCashFlow / Math.pow(1 + irr, year)
    }
    
    if (Math.abs(npv) < 1000) break
    
    if (npv > 0) {
      irr += 0.01
    } else {
      irr -= 0.01
    }
  }
  
  return irr * 100
}

// Generar recomendaciones basadas en el análisis
function generateRecommendations(
  capRate: number,
  vacancyRate: number,
  suggestedRent: number
): string[] {
  const recommendations: string[] = []
  
  if (capRate >= 8) {
    recommendations.push('✅ Excelente rentabilidad: CAP Rate superior al 8% indica una inversión muy atractiva')
  } else if (capRate >= 6) {
    recommendations.push('👍 Buena rentabilidad: CAP Rate entre 6-8% es competitivo en el mercado actual')
  } else if (capRate >= 4) {
    recommendations.push('⚠️ Rentabilidad moderada: CAP Rate entre 4-6% requiere optimización de gastos')
  } else {
    recommendations.push('❌ Baja rentabilidad: CAP Rate inferior al 4% sugiere revisar el precio de arriendo')
  }
  
  if (vacancyRate > 0.1) {
    recommendations.push('📊 Considerar reducir el tiempo de vacancia con marketing más agresivo')
  }
  
  if (suggestedRent > 0) {
    recommendations.push(`💰 El precio sugerido de $${suggestedRent.toLocaleString('es-CL')} está alineado con el mercado`)
  }
  
  recommendations.push('🔄 Revisar comparables trimestralmente para mantener competitividad')
  recommendations.push('📈 Implementar ajustes de precio escalonados para acelerar el arriendo')
  
  return recommendations
}