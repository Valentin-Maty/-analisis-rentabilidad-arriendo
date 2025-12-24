// Sistema de almacenamiento de análisis usando localStorage
// Proporciona persistencia real de datos para la aplicación

import { SavedAnalysis } from '@/types/saved-analysis';
import analysisCache from '@/lib/cache/analysisCache';
import { AnalysisStorage } from '@/lib/localStorage';

// Migrar datos de ejemplo si no existen datos en localStorage
function initializeWithExampleData() {
  const existingAnalyses = AnalysisStorage.getAll();
  
  // Solo crear datos de ejemplo si no hay análisis guardados
  if (existingAnalyses.length === 0) {
    const exampleAnalyses: SavedAnalysis[] = [
      {
        id: AnalysisStorage.generateId(),
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
        id: AnalysisStorage.generateId(),
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

    // Guardar datos de ejemplo en localStorage
    exampleAnalyses.forEach(analysis => {
      AnalysisStorage.save(analysis);
    });
  }
}

export function getAllAnalyses(): SavedAnalysis[] {
  // Intentar obtener del cache primero
  const cached = analysisCache.getList({});
  if (cached) {
    return cached;
  }
  
  // Inicializar con datos de ejemplo si es necesario
  initializeWithExampleData();
  
  // Obtener datos reales del localStorage
  const result = AnalysisStorage.getAll();
  
  // Guardar en cache por 5 minutos
  analysisCache.setList({}, result);
  return result;
}

export function getAnalysisById(id: string): SavedAnalysis | undefined {
  // Intentar obtener del cache primero
  const cached = analysisCache.get(id);
  if (cached) {
    return cached;
  }
  
  // Obtener del localStorage
  const result = AnalysisStorage.getById(id);
  
  // Si se encuentra, guardarlo en cache
  if (result) {
    analysisCache.set(id, result);
  }
  
  return result || undefined;
}

export function saveAnalysis(analysis: SavedAnalysis): SavedAnalysis {
  // Guardar en localStorage
  const success = AnalysisStorage.save(analysis);
  
  if (success) {
    // Actualizar cache
    analysisCache.set(analysis.id, analysis);
    // Invalidar listas para forzar recarga
    analysisCache.invalidateLists();
    
    // Agregar actividad al dashboard
    AnalysisStorage.addDashboardActivity({
      id: `save_${Date.now()}`,
      type: 'analysis_created',
      title: 'Análisis guardado',
      description: `"${analysis.title}" guardado exitosamente`,
      date: new Date().toISOString(),
      property_address: analysis.property.address
    });
    
    return analysis;
  } else {
    throw new Error('Error al guardar el análisis');
  }
}

export function deleteAnalysis(id: string): boolean {
  // Obtener el análisis antes de eliminarlo para logs
  const analysis = AnalysisStorage.getById(id);
  
  // Eliminar del localStorage
  const success = AnalysisStorage.delete(id);
  
  if (success) {
    // Invalidar cache
    analysisCache.invalidate(id);
    analysisCache.invalidateLists();
    
    // Agregar actividad al dashboard
    if (analysis) {
      AnalysisStorage.addDashboardActivity({
        id: `delete_${Date.now()}`,
        type: 'analysis_created', // No hay tipo específico para delete, usar genérico
        title: 'Análisis eliminado',
        description: `"${analysis.title}" fue eliminado`,
        date: new Date().toISOString(),
        property_address: analysis.property.address
      });
    }
  }
  
  return success;
}

export function updateAnalysis(id: string, updates: Partial<SavedAnalysis>): SavedAnalysis | null {
  const existingAnalysis = AnalysisStorage.getById(id);
  
  if (existingAnalysis) {
    const updatedAnalysis: SavedAnalysis = {
      ...existingAnalysis,
      ...updates,
      metadata: {
        ...existingAnalysis.metadata,
        ...updates.metadata,
        updated_at: new Date().toISOString()
      }
    };
    
    const success = AnalysisStorage.save(updatedAnalysis);
    
    if (success) {
      // Actualizar cache
      analysisCache.set(id, updatedAnalysis);
      // Invalidar listas para forzar recarga
      analysisCache.invalidateLists();
      
      return updatedAnalysis;
    }
  }
  
  return null;
}

// Función específica para actualizar el estado
export function updateAnalysisStatus(id: string, status: SavedAnalysis['metadata']['status']): boolean {
  const success = AnalysisStorage.updateStatus(id, status);
  
  if (success) {
    // Invalidar cache
    analysisCache.invalidate(id);
    analysisCache.invalidateLists();
  }
  
  return success;
}