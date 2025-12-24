/*
Domain: Local Storage Management
Responsibility: Sistema de persistencia de datos usando localStorage
Dependencies: Browser localStorage API
*/

import { SavedAnalysis } from '@/types/saved-analysis'

// Claves para localStorage
const STORAGE_KEYS = {
  ANALYSES: 'rental_analyses',
  DASHBOARD_DATA: 'dashboard_data',
  USER_PREFERENCES: 'user_preferences'
} as const

// Interfaz para datos del dashboard
export interface DashboardData {
  totalAnalyses: number
  activeRentals: number
  totalRevenue: number
  averageRentability: number
  recentActivity: DashboardActivity[]
}

export interface DashboardActivity {
  id: string
  type: 'analysis_created' | 'rental_sent' | 'client_response' | 'price_updated'
  title: string
  description: string
  date: string
  property_address?: string
}

// Helper para verificar si localStorage está disponible
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const test = 'test'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Funciones para análisis guardados
export class AnalysisStorage {
  static getAll(): SavedAnalysis[] {
    if (!isLocalStorageAvailable()) return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ANALYSES)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading analyses from localStorage:', error)
      return []
    }
  }

  static save(analysis: SavedAnalysis): boolean {
    if (!isLocalStorageAvailable()) return false
    
    try {
      const analyses = this.getAll()
      const existingIndex = analyses.findIndex(a => a.id === analysis.id)
      
      if (existingIndex >= 0) {
        analyses[existingIndex] = {
          ...analysis,
          metadata: {
            ...analysis.metadata,
            updated_at: new Date().toISOString()
          }
        }
      } else {
        analyses.push(analysis)
      }
      
      localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses))
      
      // Actualizar datos del dashboard
      this.updateDashboardStats()
      
      return true
    } catch (error) {
      console.error('Error saving analysis to localStorage:', error)
      return false
    }
  }

  static getById(id: string): SavedAnalysis | null {
    const analyses = this.getAll()
    return analyses.find(a => a.id === id) || null
  }

  static delete(id: string): boolean {
    if (!isLocalStorageAvailable()) return false
    
    try {
      const analyses = this.getAll()
      const filteredAnalyses = analyses.filter(a => a.id !== id)
      localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(filteredAnalyses))
      
      // Actualizar datos del dashboard
      this.updateDashboardStats()
      
      return true
    } catch (error) {
      console.error('Error deleting analysis:', error)
      return false
    }
  }

  static updateStatus(id: string, status: SavedAnalysis['metadata']['status']): boolean {
    const analyses = this.getAll()
    const analysisIndex = analyses.findIndex(a => a.id === id)
    
    if (analysisIndex >= 0) {
      analyses[analysisIndex].metadata.status = status
      analyses[analysisIndex].metadata.updated_at = new Date().toISOString()
      
      try {
        localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses))
        
        // Agregar actividad al dashboard
        this.addDashboardActivity({
          id: `activity_${Date.now()}`,
          type: 'rental_sent',
          title: `Estado actualizado: ${status}`,
          description: `Análisis "${analyses[analysisIndex].title}" cambió a ${status}`,
          date: new Date().toISOString(),
          property_address: analyses[analysisIndex].property.address
        })
        
        return true
      } catch (error) {
        console.error('Error updating analysis status:', error)
        return false
      }
    }
    
    return false
  }

  // Actualizar estadísticas del dashboard
  static updateDashboardStats() {
    const analyses = this.getAll()
    
    const dashboardData: DashboardData = {
      totalAnalyses: analyses.length,
      activeRentals: analyses.filter(a => a.metadata.status === 'sent_to_client' || a.metadata.status === 'published').length,
      totalRevenue: analyses.reduce((sum, a) => sum + (a.analysis.suggested_rent_clp || 0), 0),
      averageRentability: analyses.length > 0 ? 
        analyses.reduce((sum, a) => sum + (a.calculations.cap_rate || 0), 0) / analyses.length : 0,
      recentActivity: this.getRecentActivity()
    }
    
    if (isLocalStorageAvailable()) {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_DATA, JSON.stringify(dashboardData))
    }
  }

  // Agregar actividad al dashboard
  static addDashboardActivity(activity: DashboardActivity) {
    if (!isLocalStorageAvailable()) return
    
    try {
      const currentData = this.getDashboardData()
      const activities = currentData.recentActivity || []
      
      // Agregar nueva actividad al principio
      activities.unshift(activity)
      
      // Mantener solo las últimas 20 actividades
      const recentActivities = activities.slice(0, 20)
      
      const updatedData: DashboardData = {
        ...currentData,
        recentActivity: recentActivities
      }
      
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_DATA, JSON.stringify(updatedData))
    } catch (error) {
      console.error('Error adding dashboard activity:', error)
    }
  }

  // Obtener datos del dashboard
  static getDashboardData(): DashboardData {
    if (!isLocalStorageAvailable()) {
      return {
        totalAnalyses: 0,
        activeRentals: 0,
        totalRevenue: 0,
        averageRentability: 0,
        recentActivity: []
      }
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DASHBOARD_DATA)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
    
    // Si no hay datos, calcularlos desde los análisis
    this.updateDashboardStats()
    const stored = localStorage.getItem(STORAGE_KEYS.DASHBOARD_DATA)
    return stored ? JSON.parse(stored) : {
      totalAnalyses: 0,
      activeRentals: 0,
      totalRevenue: 0,
      averageRentability: 0,
      recentActivity: []
    }
  }

  // Obtener actividad reciente
  static getRecentActivity(): DashboardActivity[] {
    const analyses = this.getAll()
    const activities: DashboardActivity[] = []
    
    // Crear actividades basadas en los análisis existentes
    analyses.forEach(analysis => {
      activities.push({
        id: `analysis_${analysis.id}`,
        type: 'analysis_created',
        title: `Nuevo análisis creado`,
        description: `"${analysis.title}"`,
        date: analysis.metadata.created_at,
        property_address: analysis.property.address
      })
      
      if (analysis.metadata.status === 'sent_to_client') {
        activities.push({
          id: `sent_${analysis.id}`,
          type: 'rental_sent',
          title: `Propuesta enviada`,
          description: `Análisis "${analysis.title}" enviado al cliente`,
          date: analysis.metadata.updated_at,
          property_address: analysis.property.address
        })
      }
    })
    
    // Ordenar por fecha más reciente
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20)
  }

  // Generar ID único para nuevos análisis
  static generateId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Limpiar todos los datos (útil para testing)
  static clearAll(): boolean {
    if (!isLocalStorageAvailable()) return false
    
    try {
      localStorage.removeItem(STORAGE_KEYS.ANALYSES)
      localStorage.removeItem(STORAGE_KEYS.DASHBOARD_DATA)
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }

  // Exportar datos como JSON
  static exportData(): string {
    const data = {
      analyses: this.getAll(),
      dashboardData: this.getDashboardData(),
      exportedAt: new Date().toISOString()
    }
    return JSON.stringify(data, null, 2)
  }

  // Importar datos desde JSON
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.analyses && Array.isArray(data.analyses)) {
        localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(data.analyses))
        this.updateDashboardStats()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }
}