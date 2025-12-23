// Textos en español para la aplicación de análisis de rentabilidad
import type { LocaleStrings } from './types'

export const es: LocaleStrings = {
  common: {
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Eliminar',
    edit: 'Editar',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    close: 'Cerrar',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    import: 'Importar',
    yes: 'Sí',
    no: 'No',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
    required: 'Requerido',
    optional: 'Opcional'
  },

  navigation: {
    home: 'Inicio',
    analysis: 'Análisis',
    analyses: 'Análisis',
    properties: 'Propiedades',
    reports: 'Reportes',
    settings: 'Configuración',
    profile: 'Perfil',
    logout: 'Cerrar Sesión',
    newAnalysis: 'Nuevo Análisis',
    savedAnalyses: 'Análisis Guardados',
    help: 'Ayuda'
  },

  property: {
    title: 'Propiedad',
    address: 'Dirección',
    value: 'Valor',
    valueCLP: 'Valor en CLP',
    valueUF: 'Valor en UF',
    size: 'Superficie',
    sizeM2: 'Metros cuadrados',
    bedrooms: 'Dormitorios',
    bathrooms: 'Baños',
    parkingSpaces: 'Estacionamientos',
    storageUnits: 'Bodegas',
    propertyType: 'Tipo de propiedad',
    capturePrice: 'Precio de captación',
    capturePriceCLP: 'Precio de captación en CLP',
    capturePriceUF: 'Precio de captación en UF',
    copyFromSuggested: 'Copiar desde precio sugerido'
  },

  rental: {
    title: 'Análisis de Arriendo',
    suggestedRent: 'Renta sugerida',
    suggestedRentCLP: 'Renta sugerida en CLP',
    suggestedRentUF: 'Renta sugerida en UF',
    currency: 'Moneda',
    ufValue: 'Valor UF',
    monthlyExpenses: 'Gastos mensuales',
    annualExpenses: 'Gastos anuales',
    maintenance: 'Mantenimiento',
    propertyTax: 'Contribuciones',
    insurance: 'Seguro',
    commission: 'Comisión',
    grossYield: 'Rentabilidad bruta',
    netYield: 'Rentabilidad neta',
    capRate: 'CAP Rate',
    vacancy: 'Vacancia',
    vacancyRate: 'Tasa de vacancia',
    marketStudy: 'Estudio de mercado'
  },

  plans: {
    title: 'Planes de Arriendo',
    planA: 'Plan Premium',
    planB: 'Plan Estándar', 
    planC: 'Plan Básico',
    description: 'Descripción',
    commission: 'Comisión',
    duration: 'Duración',
    services: 'Servicios',
    priceAdjustments: 'Ajustes de precio',
    initialPrice: 'Precio inicial',
    finalPrice: 'Precio final',
    daysToRent: 'Días para arriendo',
    conservedProfitability: 'Rentabilidad conservada'
  },

  analysis: {
    title: 'Análisis',
    analysisPreview: 'Vista previa del análisis',
    commercialProposal: 'Propuesta comercial',
    executiveSummary: 'Resumen ejecutivo',
    propertyDetails: 'Detalle de la propiedad',
    profitabilityAnalysis: 'Análisis de rentabilidad',
    marketAnalysis: 'Análisis de mercado',
    recommendations: 'Recomendaciones',
    generatePDF: 'Generar PDF',
    sendToClient: 'Enviar a cliente',
    saveAnalysis: 'Guardar análisis',
    loadAnalysis: 'Cargar análisis',
    deleteAnalysis: 'Eliminar análisis',
    analysisResults: 'Resultados del análisis',
    calculateSuggestedPrice: 'Calcular precio sugerido'
  },

  comparables: {
    title: 'Propiedades comparables',
    addComparable: 'Agregar comparable',
    removeComparable: 'Eliminar comparable',
    comparableProperties: 'Propiedades similares',
    link: 'Enlace',
    similarity: 'Similitud',
    pricePerM2: 'Precio por m²',
    realTimeAnalysis: 'Análisis en tiempo real',
    marketAverage: 'Promedio de mercado',
    priceRange: 'Rango de precios',
    howToUse: 'Cómo usar',
    tips: 'Consejos'
  },

  forms: {
    propertyInfo: 'Información de la propiedad',
    rentalInfo: 'Información de arriendo',
    expenses: 'Gastos',
    clientInfo: 'Información del cliente',
    ownerInfo: 'Información del propietario',
    brokerInfo: 'Información del corredor',
    name: 'Nombre',
    email: 'Email',
    phone: 'Teléfono',
    rut: 'RUT',
    notes: 'Notas',
    comments: 'Comentarios',
    additionalInfo: 'Información adicional'
  },

  validation: {
    required: 'Este campo es requerido',
    email: 'Ingrese un email válido',
    phone: 'Ingrese un teléfono válido',
    number: 'Ingrese un número válido',
    minLength: 'Debe tener al menos {min} caracteres',
    maxLength: 'No debe exceder {max} caracteres',
    min: 'Debe ser mayor a {min}',
    max: 'Debe ser menor a {max}',
    positive: 'Debe ser un número positivo',
    rut: 'Ingrese un RUT válido',
    url: 'Ingrese una URL válida'
  },

  messages: {
    analysisCompleted: 'Análisis completado',
    analysisSaved: 'Análisis guardado exitosamente',
    analysisDeleted: 'Análisis eliminado',
    proposalSent: 'Propuesta enviada exitosamente',
    pdfGenerated: 'PDF generado exitosamente',
    invalidData: 'Datos inválidos',
    networkError: 'Error de conexión',
    serverError: 'Error del servidor',
    notFound: 'No encontrado',
    accessDenied: 'Acceso denegado',
    sessionExpired: 'Sesión expirada',
    changesNotSaved: 'Los cambios no se han guardado',
    confirmDelete: '¿Está seguro que desea eliminar?',
    confirmSend: '¿Está seguro que desea enviar la propuesta?',
    missingRequiredFields: 'Faltan campos requeridos',
    dataIncomplete: 'Datos incompletos',
    calculationError: 'Error en el cálculo',
    priceCalculated: 'Precio calculado basado en {count} comparables',
    noValidComparables: 'Debe ingresar al menos una propiedad comparable válida'
  },

  currency: {
    clp: 'Peso Chileno (CLP)',
    uf: 'Unidad de Fomento (UF)',
    usd: 'Dólar Estadounidense (USD)',
    format: {
      clp: '$#,##0',
      uf: '#,##0.00 UF',
      usd: 'US$ #,##0'
    }
  },

  dates: {
    today: 'Hoy',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    thisWeek: 'Esta semana',
    lastWeek: 'Semana pasada',
    thisMonth: 'Este mes',
    lastMonth: 'Mes pasado',
    thisYear: 'Este año',
    lastYear: 'Año pasado',
    format: {
      short: 'dd/MM/yyyy',
      long: 'dd \'de\' MMMM \'de\' yyyy',
      dateTime: 'dd/MM/yyyy HH:mm'
    }
  },

  location: {
    address: 'Dirección',
    locationOnMap: 'Ubicación en el mapa',
    searchingLocation: 'Buscando ubicación exacta...',
    locationNotFound: 'Ubicación no encontrada',
    approximateLocation: 'Ubicación aproximada',
    specificBuilding: 'Edificio específico',
    specificHouse: 'Casa específica',
    specificStreet: 'Calle específica',
    addressWithNumber: 'Dirección con número',
    viewExactLocation: 'Ver ubicación exacta',
    coordinates: 'Coordenadas',
    zoneAnalysis: 'Análisis por zona'
  },

  signature: {
    title: 'Firma',
    signHere: 'Firme aquí',
    clearSignature: 'Limpiar firma',
    signed: 'Firmado',
    signatureRequired: 'Firma requerida',
    digitalSignature: 'Firma digital'
  },

  propitalSync: {
    title: 'Integración con Propital',
    sync: 'Sincronizar',
    syncSuccessful: 'Sincronización exitosa',
    syncError: 'Error en sincronización',
    lastSync: 'Última sincronización',
    autoSync: 'Sincronización automática',
    manualSync: 'Sincronización manual',
    propitalModule: 'Módulo Propital',
    saveAsCard: 'Guardar como tarjeta de propiedad'
  },

  accessibility: {
    closeModal: 'Cerrar modal',
    openMenu: 'Abrir menú',
    skipToContent: 'Saltar al contenido principal',
    loading: 'Cargando contenido',
    sortAscending: 'Ordenar ascendente',
    sortDescending: 'Ordenar descendente',
    selectOption: 'Seleccionar opción',
    expandSection: 'Expandir sección',
    collapseSection: 'Contraer sección',
    currentPage: 'Página actual',
    goToPage: 'Ir a página',
    dangerIcon: 'Icono de peligro',
    warningIcon: 'Icono de advertencia',
    infoIcon: 'Icono de información',
    cancelAction: 'Cancelar la acción y cerrar el modal',
    confirmAction: 'Confirmar la acción y continuar'
  }
}

export type Locale = LocaleStrings
export default es