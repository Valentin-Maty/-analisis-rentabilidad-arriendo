import jsPDF from 'jspdf'
import type { RentalAnalysis, PlanComparison } from '@/types/rental'

interface SimplePDFOptions {
  analysis: RentalAnalysis
  selectedPlanIds: string[]
  planComparisons: PlanComparison[]
  brokerInfo?: {
    name: string
    email: string
    phone: string
  }
}

export const generateSimpleRentalPDF = (options: SimplePDFOptions & { rentCurrency?: 'CLP' | 'UF'; rentValueUF?: number }) => {
  const { analysis, selectedPlanIds, planComparisons, brokerInfo, rentCurrency = 'CLP', rentValueUF } = options
  
  try {
    const doc = new jsPDF()
    let yPosition = 20
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    
    // Función helper para formatear moneda
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
      }).format(amount)
    }
    
    // Función para agregar texto con salto de página automático
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.setTextColor(color[0], color[1], color[2])
      doc.setFontSize(fontSize)
      if (isBold) {
        doc.setFont('helvetica', 'bold')
      } else {
        doc.setFont('helvetica', 'normal')
      }
      
      doc.text(text, margin, yPosition)
      yPosition += fontSize * 0.5 + 5
    }
    
    // Header moderno similar al estilo web
    doc.setFillColor(79, 70, 229) // Morado similar a la web
    doc.rect(0, 0, pageWidth, 45, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont(undefined, 'bold')
    doc.text('🏠 ANÁLISIS DE RENTABILIDAD', pageWidth / 2, 20, { align: 'center' })
    
    doc.setFontSize(14)
    doc.setFont(undefined, 'normal')
    doc.text('Planes Comerciales de Arriendo en Exclusiva', pageWidth / 2, 32, { align: 'center' })
    
    yPosition = 60
    doc.setTextColor(0, 0, 0)
    
    // Información del corredor
    if (brokerInfo) {
      addText(`Corredor: ${brokerInfo.name}`, 12, true)
      addText(`Email: ${brokerInfo.email}`, 10)
      addText(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 10)
      yPosition += 10
    }
    
    // Información de la propiedad con estilo moderno
    doc.setFillColor(250, 250, 250)
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2*margin + 10, 45, 'F')
    
    addText('🏠 INFORMACIÓN DE LA PROPIEDAD', 16, true, [79, 70, 229])
    addText(`📍 ${analysis.property.address}`, 12)
    addText(`💵 Valor: ${formatCurrency(analysis.property.value_clp)}`, 12)
    if (analysis.property.value_uf) {
      addText(`💎 Valor: ${analysis.property.value_uf.toLocaleString()} UF`, 10)
    }
    addText(`📐 Superficie: ${analysis.property.size_m2} m²`, 12)
    
    // Mostrar precio según la moneda seleccionada
    if (rentCurrency === 'UF' && rentValueUF) {
      addText(`💰 Precio Inicial: ${rentValueUF} UF (${formatCurrency(analysis.recommended_initial_rent)})`, 12, true, [34, 197, 94])
    } else {
      addText(`💰 Precio Inicial: ${formatCurrency(analysis.recommended_initial_rent)}`, 12, true, [34, 197, 94])
    }
    yPosition += 15
    
    // Indicadores Clave con estilo
    doc.setFillColor(240, 249, 255)
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2*margin + 10, 35, 'F')
    
    addText('📊 INDICADORES CLAVE', 16, true, [79, 70, 229])
    addText(`🎯 CAP Rate: ${analysis.cap_rate_analysis.cap_rate_percentage.toFixed(2)}%`, 12, true, [34, 197, 94])
    addText(`📈 Ingreso Neto Anual: ${formatCurrency(analysis.cap_rate_analysis.net_operating_income)}`, 12)
    addText(`⚠️ Pérdida por mes vacante: ${analysis.vacancy_impact.percentage_annual_loss.toFixed(1)}%`, 12, false, [234, 88, 12])
    yPosition += 15
    
    // Planes seleccionados con estilo destacado
    addText('⚙️ PLANES COMERCIALES SELECCIONADOS', 16, true, [79, 70, 229])
    yPosition += 5
    
    const selectedPlans = analysis.plans.filter(plan => selectedPlanIds.includes(plan.id))
    
    selectedPlans.forEach((plan, index) => {
      if (index > 0) yPosition += 8
      
      // Background para cada plan
      const planColors = {
        'A': [240, 253, 244], // Verde claro
        'B': [255, 247, 237], // Naranja claro  
        'C': [239, 246, 255]  // Azul claro
      }
      
      const planColor = planColors[plan.id as keyof typeof planColors] || [250, 250, 250]
      doc.setFillColor(planColor[0], planColor[1], planColor[2])
      
      const planHeight = 45 + plan.price_adjustment_schedule.length * 6
      doc.rect(margin - 5, yPosition - 5, pageWidth - 2*margin + 10, planHeight, 'F')
      
      const planIcon = plan.id === 'A' ? '🥇' : plan.id === 'B' ? '🥈' : '🥉'
      addText(`${planIcon} Plan ${plan.id} - ${plan.name}`, 14, true, [79, 70, 229])
      addText(plan.description, 10)
      addText(`💰 Precio inicial: ${formatCurrency(plan.initial_rent_clp)}`, 12, true, [34, 197, 94])
      addText(`💼 Comisión anual: ${plan.commission_percentage}%`, 11)
      
      // Cronograma de ajustes
      addText('📅 Cronograma de Precios:', 11, true)
      plan.price_adjustment_schedule.forEach(adjustment => {
        const dayText = adjustment.day === 0 ? '🚀 Inicio' : `📅 Día ${adjustment.day}`
        const priceText = adjustment.percentage_reduction === 0 
          ? formatCurrency(adjustment.new_rent_clp)
          : `${formatCurrency(adjustment.new_rent_clp)} (-${adjustment.percentage_reduction}%)`
        
        addText(`   • ${dayText}: ${priceText}`, 9)
      })
      
      // Métricas del plan
      const comparison = planComparisons.find(comp => comp.plan_id === plan.id)
      if (comparison) {
        addText(`⏱️ Tiempo esperado: ${comparison.expected_rental_time} días`, 10)
        addText(`💵 Ingreso neto anual: ${formatCurrency(comparison.net_annual_income)}`, 10, true, [34, 197, 94])
      }
      
      yPosition += 10
    })
    
    // Términos y Condiciones con estilo
    yPosition += 10
    doc.setFillColor(254, 242, 242)
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2*margin + 10, 45, 'F')
    
    addText('📋 TÉRMINOS Y CONDICIONES', 16, true, [79, 70, 229])
    addText('• El análisis es válido por 30 días desde la fecha de generación.', 10)
    addText('• Se requiere aceptación de al menos 1 plan para proceder con publicación.', 10)
    addText('• Los ajustes de precio se realizan automáticamente según cronograma.', 10)
    addText('• Cada mes de vacancia representa una pérdida del 1.83% de rentabilidad anual.', 10, false, [234, 88, 12])
    
    // Sección de aceptación y firma
    yPosition += 20
    if (yPosition > 230) {
      doc.addPage()
      yPosition = 20
    }
    
    doc.setFillColor(240, 253, 244)
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2*margin + 10, 60, 'F')
    
    addText('✍️ ACEPTACIÓN DEL CLIENTE', 16, true, [79, 70, 229])
    yPosition += 5
    
    // Campos para llenar
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    addText('Nombre completo: ________________________________________', 11)
    yPosition += 8
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    addText('RUT: ____________________  Fecha: ______________________', 11)
    yPosition += 8
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    addText('Plan(es) aceptado(s): [ ] Plan A   [ ] Plan B   [ ] Plan C', 11)
    yPosition += 12
    doc.line(margin + 10, yPosition, margin + 70, yPosition)
    addText('Firma: _____________________', 11)
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text('TuMatch - Análisis de Rentabilidad Arriendos', margin, 290)
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 40, 290)
    }
    
    // Generar nombre del archivo
    const fileName = `analisis-arriendo-${analysis.property.address.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    
    // Descargar PDF
    doc.save(fileName)
    
    return true
    
  } catch (error) {
    console.error('Error generando PDF:', error)
    throw new Error('Error al generar el PDF: ' + (error as Error).message)
  }
}