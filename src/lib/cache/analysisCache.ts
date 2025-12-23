/*
Domain: Caching
Responsibility: Cache en memoria para análisis de rentabilidad
Dependencies: SavedAnalysis types
*/

import type { SavedAnalysis } from '@/types/saved-analysis'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  lastClearTime: number
}

class AnalysisCache {
  private cache = new Map<string, CacheEntry<SavedAnalysis | SavedAnalysis[]>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutos por defecto
  private maxSize = 100 // Máximo 100 entradas
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    lastClearTime: Date.now()
  }

  // Generar clave de cache
  private generateKey(type: string, params: Record<string, any> = {}): string {
    const paramsStr = Object.entries(params)
      .sort()
      .map(([key, value]) => `${key}:${value}`)
      .join('|')
    return `${type}:${paramsStr}`
  }

  // Verificar si una entrada ha expirado
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiry
  }

  // Limpiar entradas expiradas
  private cleanupExpired(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.cache.delete(key))
    this.updateStats()
  }

  // Actualizar estadísticas
  private updateStats(): void {
    this.stats.size = this.cache.size
  }

  // Evict LRU si el cache está lleno
  private evictIfNeeded(): void {
    if (this.cache.size >= this.maxSize) {
      // Encontrar la entrada más antigua
      let oldestKey = ''
      let oldestTime = Date.now()
      
      this.cache.forEach((entry, key) => {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp
          oldestKey = key
        }
      })
      
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
  }

  // Obtener un análisis individual por ID
  get(id: string): SavedAnalysis | null {
    const key = this.generateKey('analysis', { id })
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }
    
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }
    
    // Actualizar timestamp para LRU
    entry.timestamp = Date.now()
    this.stats.hits++
    return entry.data as SavedAnalysis
  }

  // Guardar un análisis individual
  set(id: string, analysis: SavedAnalysis, ttl?: number): void {
    const key = this.generateKey('analysis', { id })
    const expiryTime = Date.now() + (ttl || this.defaultTTL)
    
    this.evictIfNeeded()
    this.cache.set(key, {
      data: analysis,
      timestamp: Date.now(),
      expiry: expiryTime
    })
    this.updateStats()
  }

  // Obtener lista de análisis con filtros
  getList(filters: Record<string, any> = {}): SavedAnalysis[] | null {
    const key = this.generateKey('list', filters)
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }
    
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }
    
    entry.timestamp = Date.now()
    this.stats.hits++
    return entry.data as SavedAnalysis[]
  }

  // Guardar lista de análisis
  setList(filters: Record<string, any>, analyses: SavedAnalysis[], ttl?: number): void {
    const key = this.generateKey('list', filters)
    const expiryTime = Date.now() + (ttl || this.defaultTTL)
    
    this.evictIfNeeded()
    this.cache.set(key, {
      data: analyses,
      timestamp: Date.now(),
      expiry: expiryTime
    })
    this.updateStats()
  }

  // Invalidar cache de un análisis específico
  invalidate(id: string): void {
    const key = this.generateKey('analysis', { id })
    this.cache.delete(key)
    
    // También invalidar todas las listas que puedan contener este análisis
    this.invalidateLists()
    this.updateStats()
  }

  // Invalidar todas las listas
  invalidateLists(): void {
    const keysToDelete: string[] = []
    
    this.cache.forEach((_, key) => {
      if (key.startsWith('list:')) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.cache.delete(key))
    this.updateStats()
  }

  // Limpiar todo el cache
  clear(): void {
    this.cache.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastClearTime: Date.now()
    }
  }

  // Limpiar entradas expiradas manualmente
  cleanup(): void {
    this.cleanupExpired()
  }

  // Obtener estadísticas del cache
  getStats(): CacheStats & { hitRate: number } {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0
    
    return {
      ...this.stats,
      hitRate: Number(hitRate.toFixed(2))
    }
  }

  // Configurar TTL por defecto
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl
  }

  // Configurar tamaño máximo del cache
  setMaxSize(size: number): void {
    this.maxSize = size
    // Si el cache actual es más grande, limpiar
    while (this.cache.size > this.maxSize) {
      this.evictIfNeeded()
    }
  }

  // Obtener todas las claves del cache (para debugging)
  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Verificar si existe una clave
  has(key: string): boolean {
    return this.cache.has(key)
  }

  // Obtener información de una entrada específica
  getEntry(key: string): CacheEntry<SavedAnalysis | SavedAnalysis[]> | undefined {
    return this.cache.get(key)
  }
}

// Singleton instance
const analysisCache = new AnalysisCache()

// Auto-cleanup cada 10 minutos
setInterval(() => {
  analysisCache.cleanup()
}, 10 * 60 * 1000)

export default analysisCache
export type { CacheEntry, CacheStats }