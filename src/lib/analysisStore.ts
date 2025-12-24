// Sistema de almacenamiento de análisis usando localStorage
// Proporciona persistencia real de datos para la aplicación

import { SavedAnalysis } from '@/types/saved-analysis';
import analysisCache from '@/lib/cache/analysisCache';
import { AnalysisStorage } from '@/lib/localStorage';

// No inicializar con datos de ejemplo - empezar con aplicación vacía
function initializeWithExampleData() {
  // No hacer nada - la aplicación empieza sin datos
  return;
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