// Simulación de almacenamiento para análisis
// En producción esto debería ser reemplazado por una base de datos real

import { SavedAnalysis } from '@/types/saved-analysis';

// Store en memoria para desarrollo
let analyses: SavedAnalysis[] = [];

// Inicializar con datos de ejemplo
function initializeStore() {
  if (analyses.length === 0) {
    const exampleAnalyses: SavedAnalysis[] = [
      {
        id: '1',
        title: 'Departamento Las Condes - Av. Providencia',
        property: {
          address: 'Av. Providencia 123, Las Condes, Santiago',
          value_clp: 95000000,
          value_uf: 2500,
          size_m2: 75,
          bedrooms: 2,
          bathrooms: 2,
          parking_spaces: 1,
          storage_units: 1,
        },
        analysis: {
          suggested_rent_clp: 850000,
          rent_currency: 'CLP',
          capture_price_clp: 850000,
          capture_price_currency: 'CLP',
          comparable_properties: [],
          annual_expenses: {
            maintenance_clp: 1200000,
            property_tax_clp: 800000,
            insurance_clp: 300000,
          },
          uf_value_clp: 38000,
        },
        calculations: {
          cap_rate: 8.5,
          annual_rental_yield: 10.7,
          monthly_net_income: 658333,
          vacancy_cost_per_month: 70833,
          break_even_rent_reduction: 8.33,
          plan_comparisons: [],
        },
        metadata: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          broker_email: 'corredor@ejemplo.com',
          status: 'draft',
          tags: ['departamento', 'las-condes'],
          notes: 'Análisis inicial para propiedad en excelente ubicación',
        },
      },
      {
        id: '2',
        title: 'Casa Providencia - Zona Residencial',
        property: {
          address: 'Calle Los Leones 456, Providencia, Santiago',
          value_clp: 120000000,
          size_m2: 120,
          bedrooms: 3,
          bathrooms: 2,
          parking_spaces: 2,
          storage_units: 0,
        },
        analysis: {
          suggested_rent_clp: 1200000,
          rent_currency: 'CLP',
          comparable_properties: [],
          annual_expenses: {
            maintenance_clp: 1500000,
            property_tax_clp: 1000000,
            insurance_clp: 400000,
          },
          uf_value_clp: 38000,
        },
        calculations: {
          cap_rate: 9.2,
          annual_rental_yield: 12.0,
          monthly_net_income: 958333,
          vacancy_cost_per_month: 100000,
          break_even_rent_reduction: 8.33,
          plan_comparisons: [],
        },
        metadata: {
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          broker_email: 'corredor@ejemplo.com',
          status: 'sent_to_client',
          tags: ['casa', 'providencia'],
        },
      },
    ];
    analyses = exampleAnalyses;
  }
}

export function getAllAnalyses(): SavedAnalysis[] {
  initializeStore();
  return [...analyses];
}

export function getAnalysisById(id: string): SavedAnalysis | undefined {
  initializeStore();
  return analyses.find(analysis => analysis.id === id);
}

export function saveAnalysis(analysis: SavedAnalysis): SavedAnalysis {
  initializeStore();
  const existingIndex = analyses.findIndex(a => a.id === analysis.id);
  
  if (existingIndex >= 0) {
    analyses[existingIndex] = analysis;
  } else {
    analyses.push(analysis);
  }
  
  return analysis;
}

export function deleteAnalysis(id: string): boolean {
  initializeStore();
  const index = analyses.findIndex(analysis => analysis.id === id);
  
  if (index >= 0) {
    analyses.splice(index, 1);
    return true;
  }
  
  return false;
}

export function updateAnalysis(id: string, updates: Partial<SavedAnalysis>): SavedAnalysis | null {
  initializeStore();
  const index = analyses.findIndex(analysis => analysis.id === id);
  
  if (index >= 0) {
    analyses[index] = { ...analyses[index], ...updates };
    return analyses[index];
  }
  
  return null;
}