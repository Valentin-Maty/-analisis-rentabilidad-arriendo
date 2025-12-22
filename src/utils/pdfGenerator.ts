import jsPDF from 'jspdf'
import type { RentalAnalysis, PlanComparison } from '@/types/rental'

interface PDFOptions {
  analysis: RentalAnalysis
  selectedPlanIds: string[]
  planComparisons: PlanComparison[]
  brokerInfo?: {
    name: string
    email: string
    phone: string
    company: string
  }
}

export class RentalPDFGenerator {
  private pdf: jsPDF
  private pageHeight: number
  private pageWidth: number
  private margin: number
  private currentY: number

  constructor() {
    this.pdf = new jsPDF()
    this.pageHeight = this.pdf.internal.pageSize.height
    this.pageWidth = this.pdf.internal.pageSize.width
    this.margin = 20
    this.currentY = this.margin
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  private addTitle(text: string, fontSize: number = 16): void {
    this.checkPageBreak(20)
    this.pdf.setFontSize(fontSize)
    this.pdf.setFont(undefined, 'bold')
    this.pdf.text(text, this.margin, this.currentY)
    this.currentY += fontSize + 5
  }

  private addSubtitle(text: string, fontSize: number = 12): void {
    this.checkPageBreak(15)
    this.pdf.setFontSize(fontSize)
    this.pdf.setFont(undefined, 'normal')
    this.pdf.text(text, this.margin, this.currentY)
    this.currentY += fontSize + 3
  }

  private addText(text: string, fontSize: number = 10, indent: number = 0): void {
    this.checkPageBreak(12)
    this.pdf.setFontSize(fontSize)
    this.pdf.setFont(undefined, 'normal')
    this.pdf.text(text, this.margin + indent, this.currentY)
    this.currentY += fontSize + 2
  }

  private addKeyValue(key: string, value: string, fontSize: number = 10): void {
    this.checkPageBreak(12)
    this.pdf.setFontSize(fontSize)
    this.pdf.setFont(undefined, 'normal')
    this.pdf.text(key + ':', this.margin, this.currentY)
    this.pdf.setFont(undefined, 'bold')
    this.pdf.text(value, this.margin + 80, this.currentY)
    this.currentY += fontSize + 2
  }

  private addSeparator(): void {
    this.checkPageBreak(10)
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 10
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.pdf.addPage()
      this.currentY = this.margin
    }
  }

  private addHeader(analysis: RentalAnalysis, brokerInfo?: PDFOptions['brokerInfo']): void {
    // Logo/Header placeholder
    this.pdf.setFillColor(59, 130, 246)
    this.pdf.rect(this.margin, this.margin, this.pageWidth - 2 * this.margin, 30, 'F')
    
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(18)
    this.pdf.setFont(undefined, 'bold')
    this.pdf.text('ANÁLISIS DE RENTABILIDAD - ARRIENDOS', this.margin + 5, this.margin + 20)
    
    this.currentY = this.margin + 40
    this.pdf.setTextColor(0, 0, 0)
    
    // Información del broker
    if (brokerInfo) {
      this.pdf.setFontSize(10)
      this.pdf.text(`Corredor: ${brokerInfo.name}`, this.pageWidth - 80, this.margin + 15)
      this.pdf.text(`Email: ${brokerInfo.email}`, this.pageWidth - 80, this.margin + 25)
    }
    
    this.pdf.setFontSize(12)
    this.pdf.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, this.pageWidth - 80, this.margin + 35)
  }

  private addPropertySummary(analysis: RentalAnalysis): void {
    this.addTitle('RESUMEN DE LA PROPIEDAD', 14)
    
    this.addKeyValue('Dirección', analysis.property.address)
    if (analysis.property.value_uf) {
      this.addKeyValue('Valor UF', `${analysis.property.value_uf.toLocaleString()} UF`)
    }
    this.addKeyValue('Valor CLP', `$${analysis.property.value_clp.toLocaleString()} CLP`)
    
    if (analysis.property.size_m2) {
      this.addKeyValue('Superficie', `${analysis.property.size_m2} m²`)
    }
    
    if (analysis.property.bedrooms) {
      this.addKeyValue('Dormitorios', analysis.property.bedrooms.toString())
    }
    
    if (analysis.property.bathrooms) {
      this.addKeyValue('Baños', analysis.property.bathrooms.toString())
    }
    
    this.addKeyValue('Precio Inicial Sugerido', this.formatCurrency(analysis.recommended_initial_rent))
    
    this.addSeparator()
  }

  private addAnalysisSummary(analysis: RentalAnalysis): void {
    this.addTitle('ANÁLISIS DE RENTABILIDAD', 14)
    
    this.addSubtitle('CAP Rate Analysis:')
    this.addKeyValue('CAP Rate', `${analysis.cap_rate_analysis.cap_rate_percentage.toFixed(2)}%`)
    this.addKeyValue('Valor de la Propiedad', this.formatCurrency(analysis.cap_rate_analysis.property_value_clp))
    this.addKeyValue('Ingreso Anual Bruto', this.formatCurrency(analysis.cap_rate_analysis.annual_rental_income))
    this.addKeyValue('Gastos Anuales', this.formatCurrency(analysis.cap_rate_analysis.annual_expenses))
    this.addKeyValue('NOI (Ingreso Neto)', this.formatCurrency(analysis.cap_rate_analysis.net_operating_income))
    
    this.currentY += 5
    this.addSubtitle('Impacto de Vacancia:')
    this.addKeyValue('Pérdida por mes vacante', `${analysis.vacancy_impact.percentage_annual_loss.toFixed(1)}%`)
    this.addKeyValue('Costo mensual de vacancia', this.formatCurrency(analysis.vacancy_impact.lost_income_clp))
    this.addKeyValue('Reducción máxima viable', `${analysis.vacancy_impact.break_even_reduction_percentage.toFixed(1)}%`)
    
    this.addSeparator()
  }

  private addMarketStudy(analysis: RentalAnalysis): void {
    this.addTitle('ESTUDIO DE MERCADO', 14)
    
    this.addKeyValue('Precio promedio por m²', `$${analysis.market_study.average_rent_per_m2.toLocaleString()}`)
    this.addKeyValue('Rango mínimo de mercado', this.formatCurrency(analysis.market_study.market_range.min_rent_clp))
    this.addKeyValue('Rango máximo de mercado', this.formatCurrency(analysis.market_study.market_range.max_rent_clp))
    
    this.currentY += 5
    this.addSubtitle('Factores del Sector:')
    this.addKeyValue('Score de Ubicación', `${analysis.market_study.neighborhood_factors.location_score}/10`)
    this.addKeyValue('Acceso a Transporte', `${analysis.market_study.neighborhood_factors.transportation_access}/10`)
    this.addKeyValue('Servicios y Amenidades', `${analysis.market_study.neighborhood_factors.amenities_score}/10`)
    
    this.addSeparator()
  }

  private addRentalPlans(analysis: RentalAnalysis, selectedPlanIds: string[], planComparisons: PlanComparison[]): void {
    this.addTitle('PLANES COMERCIALES PROPUESTOS', 14)
    
    const selectedPlans = analysis.plans.filter(plan => selectedPlanIds.includes(plan.id))
    
    selectedPlans.forEach((plan, index) => {
      if (index > 0) this.currentY += 5
      
      this.addSubtitle(`Plan ${plan.id} - ${plan.name}:`)
      this.addText(plan.description, 9, 10)
      
      this.addKeyValue('Precio inicial', this.formatCurrency(plan.initial_rent_clp))
      this.addKeyValue('Comisión anual', `${plan.commission_percentage}%`)
      this.addKeyValue('Duración marketing', `${plan.marketing_duration_days} días`)
      this.addKeyValue('Nivel de servicio', plan.service_level)
      
      // Cronograma de ajustes
      this.currentY += 3
      this.addText('Cronograma de Ajustes de Precio:', 10, 10)
      
      plan.price_adjustment_schedule.forEach(adjustment => {
        const dayText = adjustment.day === 0 ? 'Inicio' : `Día ${adjustment.day}`
        const priceText = adjustment.percentage_reduction === 0 
          ? this.formatCurrency(adjustment.new_rent_clp)
          : `${this.formatCurrency(adjustment.new_rent_clp)} (-${adjustment.percentage_reduction}%)`
        
        this.addText(`${dayText}: ${priceText}`, 9, 20)
      })
      
      // Métricas de comparación
      const comparison = planComparisons.find(comp => comp.plan_id === plan.id)
      if (comparison) {
        this.currentY += 3
        this.addText('Proyecciones:', 10, 10)
        this.addKeyValue('Tiempo esperado de arriendo', `${comparison.expected_rental_time} días`)
        this.addKeyValue('Comisión total anual', this.formatCurrency(comparison.total_commission))
        this.addKeyValue('Ingreso neto anual', this.formatCurrency(comparison.net_annual_income))
        this.addKeyValue('Score de riesgo vacancia', `${comparison.vacancy_risk_score}/10`)
        this.addKeyValue('Score de recomendación', `${comparison.recommendation_score.toFixed(1)}/10`)
      }
      
      if (index < selectedPlans.length - 1) {
        this.addSeparator()
      }
    })
  }

  private addFooter(): void {
    this.currentY += 20
    
    this.addTitle('INFORMACIÓN IMPORTANTE', 12)
    
    const importantInfo = [
      '• El cliente debe aceptar al menos 1 plan comercial para publicar la propiedad',
      '• Los ajustes de precio se realizan automáticamente según el cronograma establecido',
      '• Si no se arrienda en 30 días, se puede mantener 30 días más ajustando la propuesta comercial',
      '• Cada mes de vacancia representa una pérdida del 8.33% de la rentabilidad anual',
      '• En caso de no aceptar ningún plan, se debe comunicar inmediatamente a gerencia'
    ]
    
    importantInfo.forEach(info => {
      this.addText(info, 9)
    })
    
    this.currentY += 10
    this.addSeparator()
    
    this.addText('Este análisis es válido por 30 días desde la fecha de emisión.', 8)
    this.addText('Para consultas contactar al corredor asignado.', 8)
    
    // Footer
    const footerY = this.pageHeight - 15
    this.pdf.setFontSize(8)
    this.pdf.setTextColor(128, 128, 128)
    this.pdf.text('Generado por TuMatch - Sistema de Análisis de Rentabilidad para Arriendos', 
                  this.margin, footerY)
    this.pdf.text(`Página ${this.pdf.getCurrentPageInfo().pageNumber}`, 
                  this.pageWidth - 30, footerY)
  }

  public generatePDF(options: PDFOptions): Uint8Array {
    const { analysis, selectedPlanIds, planComparisons, brokerInfo } = options
    
    // Generar contenido del PDF
    this.addHeader(analysis, brokerInfo)
    this.addPropertySummary(analysis)
    this.addAnalysisSummary(analysis)
    this.addMarketStudy(analysis)
    this.addRentalPlans(analysis, selectedPlanIds, planComparisons)
    this.addFooter()
    
    // Retornar el PDF como array de bytes
    return this.pdf.output('arraybuffer') as Uint8Array
  }

  public downloadPDF(options: PDFOptions, filename?: string): void {
    this.generatePDF(options)
    
    const defaultFilename = `analisis-arriendo-${analysis.property.address.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    
    this.pdf.save(filename || defaultFilename)
  }
}

// Función helper para generar y descargar PDF
export const generateRentalAnalysisPDF = (options: PDFOptions) => {
  const generator = new RentalPDFGenerator()
  generator.downloadPDF(options)
}

// Función helper para generar PDF para envío por email
export const generateRentalAnalysisPDFForEmail = (options: PDFOptions): Uint8Array => {
  const generator = new RentalPDFGenerator()
  return generator.generatePDF(options)
}