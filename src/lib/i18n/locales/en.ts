// English texts for the rental profitability analysis app
import type { LocaleStrings } from './types'

export const en: LocaleStrings = {
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    yes: 'Yes',
    no: 'No',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    required: 'Required',
    optional: 'Optional'
  },

  navigation: {
    home: 'Home',
    analysis: 'Analysis',
    analyses: 'Analyses',
    properties: 'Properties',
    reports: 'Reports',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    newAnalysis: 'New Analysis',
    savedAnalyses: 'Saved Analyses',
    help: 'Help'
  },

  property: {
    title: 'Property',
    address: 'Address',
    value: 'Value',
    valueCLP: 'Value in CLP',
    valueUF: 'Value in UF',
    size: 'Size',
    sizeM2: 'Square meters',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    parkingSpaces: 'Parking spaces',
    storageUnits: 'Storage units',
    propertyType: 'Property type',
    capturePrice: 'Capture price',
    capturePriceCLP: 'Capture price in CLP',
    capturePriceUF: 'Capture price in UF',
    copyFromSuggested: 'Copy from suggested price'
  },

  rental: {
    title: 'Rental Analysis',
    suggestedRent: 'Suggested rent',
    suggestedRentCLP: 'Suggested rent in CLP',
    suggestedRentUF: 'Suggested rent in UF',
    currency: 'Currency',
    ufValue: 'UF Value',
    monthlyExpenses: 'Monthly expenses',
    annualExpenses: 'Annual expenses',
    maintenance: 'Maintenance',
    propertyTax: 'Property tax',
    insurance: 'Insurance',
    commission: 'Commission',
    grossYield: 'Gross yield',
    netYield: 'Net yield',
    capRate: 'CAP Rate',
    vacancy: 'Vacancy',
    vacancyRate: 'Vacancy rate',
    marketStudy: 'Market study'
  },

  plans: {
    title: 'Rental Plans',
    planA: 'Premium Plan',
    planB: 'Standard Plan',
    planC: 'Basic Plan',
    description: 'Description',
    commission: 'Commission',
    duration: 'Duration',
    services: 'Services',
    priceAdjustments: 'Price adjustments',
    initialPrice: 'Initial price',
    finalPrice: 'Final price',
    daysToRent: 'Days to rent',
    conservedProfitability: 'Conserved profitability'
  },

  analysis: {
    title: 'Analysis',
    newAnalysis: 'New analysis',
    savedAnalyses: 'Saved analyses',
    analysisPreview: 'Analysis preview',
    commercialProposal: 'Commercial proposal',
    executiveSummary: 'Executive summary',
    propertyDetails: 'Property details',
    profitabilityAnalysis: 'Profitability analysis',
    marketAnalysis: 'Market analysis',
    recommendations: 'Recommendations',
    generatePDF: 'Generate PDF',
    sendToClient: 'Send to client',
    saveAnalysis: 'Save analysis',
    loadAnalysis: 'Load analysis',
    deleteAnalysis: 'Delete analysis',
    analysisResults: 'Analysis results',
    calculateSuggestedPrice: 'Calculate suggested price'
  },

  comparables: {
    title: 'Comparable properties',
    addComparable: 'Add comparable',
    removeComparable: 'Remove comparable',
    comparableProperties: 'Similar properties',
    link: 'Link',
    similarity: 'Similarity',
    pricePerM2: 'Price per sqm',
    realTimeAnalysis: 'Real-time analysis',
    marketAverage: 'Market average',
    priceRange: 'Price range',
    howToUse: 'How to use',
    tips: 'Tips'
  },

  forms: {
    propertyInfo: 'Property information',
    rentalInfo: 'Rental information',
    expenses: 'Expenses',
    clientInfo: 'Client information',
    ownerInfo: 'Owner information',
    brokerInfo: 'Broker information',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    rut: 'RUT',
    notes: 'Notes',
    comments: 'Comments',
    additionalInfo: 'Additional information'
  },

  validation: {
    required: 'This field is required',
    email: 'Enter a valid email',
    phone: 'Enter a valid phone number',
    number: 'Enter a valid number',
    minLength: 'Must be at least {min} characters',
    maxLength: 'Must not exceed {max} characters',
    min: 'Must be greater than {min}',
    max: 'Must be less than {max}',
    positive: 'Must be a positive number',
    rut: 'Enter a valid RUT',
    url: 'Enter a valid URL'
  },

  messages: {
    analysisCompleted: 'Analysis completed',
    analysisSaved: 'Analysis saved successfully',
    analysisDeleted: 'Analysis deleted',
    proposalSent: 'Proposal sent successfully',
    pdfGenerated: 'PDF generated successfully',
    invalidData: 'Invalid data',
    networkError: 'Network error',
    serverError: 'Server error',
    notFound: 'Not found',
    accessDenied: 'Access denied',
    sessionExpired: 'Session expired',
    changesNotSaved: 'Changes have not been saved',
    confirmDelete: 'Are you sure you want to delete?',
    confirmSend: 'Are you sure you want to send the proposal?',
    missingRequiredFields: 'Missing required fields',
    dataIncomplete: 'Incomplete data',
    calculationError: 'Calculation error',
    priceCalculated: 'Price calculated based on {count} comparables',
    noValidComparables: 'Must enter at least one valid comparable property'
  },

  currency: {
    clp: 'Chilean Peso (CLP)',
    uf: 'Unidad de Fomento (UF)',
    usd: 'US Dollar (USD)',
    format: {
      clp: '$#,##0',
      uf: '#,##0.00 UF',
      usd: 'US$ #,##0'
    }
  },

  dates: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    thisYear: 'This year',
    lastYear: 'Last year',
    format: {
      short: 'MM/dd/yyyy',
      long: 'MMMM dd, yyyy',
      dateTime: 'MM/dd/yyyy HH:mm'
    }
  },

  location: {
    address: 'Address',
    locationOnMap: 'Location on map',
    searchingLocation: 'Searching exact location...',
    locationNotFound: 'Location not found',
    approximateLocation: 'Approximate location',
    specificBuilding: 'Specific building',
    specificHouse: 'Specific house',
    specificStreet: 'Specific street',
    addressWithNumber: 'Address with number',
    viewExactLocation: 'View exact location',
    coordinates: 'Coordinates',
    zoneAnalysis: 'Zone analysis'
  },

  signature: {
    title: 'Signature',
    signHere: 'Sign here',
    clearSignature: 'Clear signature',
    signed: 'Signed',
    signatureRequired: 'Signature required',
    digitalSignature: 'Digital signature'
  },

  propitalSync: {
    title: 'Propital Integration',
    sync: 'Sync',
    syncSuccessful: 'Sync successful',
    syncError: 'Sync error',
    lastSync: 'Last sync',
    autoSync: 'Auto sync',
    manualSync: 'Manual sync',
    propitalModule: 'Propital Module',
    saveAsCard: 'Save as property card'
  },

  accessibility: {
    closeModal: 'Close modal',
    openMenu: 'Open menu',
    skipToContent: 'Skip to main content',
    loading: 'Loading content',
    sortAscending: 'Sort ascending',
    sortDescending: 'Sort descending',
    selectOption: 'Select option',
    expandSection: 'Expand section',
    collapseSection: 'Collapse section',
    currentPage: 'Current page',
    goToPage: 'Go to page',
    dangerIcon: 'Danger icon',
    warningIcon: 'Warning icon',
    infoIcon: 'Information icon',
    cancelAction: 'Cancel action and close modal',
    confirmAction: 'Confirm action and continue'
  }
} as const

export default en