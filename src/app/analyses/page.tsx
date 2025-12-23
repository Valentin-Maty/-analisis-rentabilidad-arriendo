'use client';

import { useState, useEffect } from 'react';
import { SavedAnalysis, AnalysisFilters, AnalysisListResponse } from '@/types/saved-analysis';
import Link from 'next/link';

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalysisFilters>({
    search: '',
    status: undefined,
    sortBy: 'updated_at',
    sortOrder: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'sent_to_client', label: 'Enviado al cliente' },
    { value: 'client_responded', label: 'Cliente respondió' },
    { value: 'published', label: 'Publicado' },
    { value: 'archived', label: 'Archivado' },
  ];

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent_to_client: 'bg-blue-100 text-blue-800',
    client_responded: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    draft: 'Borrador',
    sent_to_client: 'Enviado',
    client_responded: 'Respondido',
    published: 'Publicado',
    archived: 'Archivado',
  };

  // Función para cargar análisis
  const loadAnalyses = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.status) queryParams.set('status', filters.status);
      if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.set('sortOrder', filters.sortOrder);
      queryParams.set('page', currentPage.toString());
      queryParams.set('pageSize', '12');

      const response = await fetch(`/api/analyses?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los análisis');
      }

      const data: AnalysisListResponse = await response.json();
      setAnalyses(data.analyses);
      setTotalPages(Math.ceil(data.total / 12));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar análisis al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadAnalyses();
  }, [filters, currentPage]);

  // Función para eliminar un análisis
  const deleteAnalysis = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este análisis?')) {
      return;
    }

    try {
      const response = await fetch(`/api/analyses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recargar la lista después de eliminar
        loadAnalyses();
      } else {
        const error = await response.json();
        alert(`Error al eliminar: ${error.error}`);
      }
    } catch (error) {
      alert('Error al eliminar el análisis');
    }
  };

  // Función para cambiar el estado de un análisis
  const updateAnalysisStatus = async (id: string, newStatus: SavedAnalysis['metadata']['status']) => {
    try {
      const response = await fetch(`/api/analyses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadAnalyses();
      } else {
        const error = await response.json();
        alert(`Error al actualizar: ${error.error}`);
      }
    } catch (error) {
      alert('Error al actualizar el estado');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Análisis Guardados</h1>
              <p className="text-gray-600 mt-1">Gestiona todos tus análisis de rentabilidad</p>
            </div>
            <Link 
              href="/analisis-precio" 
              className="btn btn-primary flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Nuevo Análisis</span>
            </Link>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Búsqueda */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por dirección o título..."
                    value={filters.search}
                    onChange={(e) => {
                      setFilters({ ...filters, search: e.target.value });
                      setCurrentPage(1);
                    }}
                    className="input pl-10 w-full"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn btn-secondary text-sm"
                >
                  🎛️ Filtros
                </button>
                
                <select
                  value={filters.status || ''}
                  onChange={(e) => {
                    setFilters({ 
                      ...filters, 
                      status: e.target.value as SavedAnalysis['metadata']['status'] || undefined 
                    });
                    setCurrentPage(1);
                  }}
                  className="input text-sm min-w-[140px]"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('_');
                    setFilters({ 
                      ...filters, 
                      sortBy: sortBy as AnalysisFilters['sortBy'],
                      sortOrder: sortOrder as AnalysisFilters['sortOrder']
                    });
                  }}
                  className="input text-sm min-w-[140px]"
                >
                  <option value="updated_at_desc">Más reciente</option>
                  <option value="updated_at_asc">Más antiguo</option>
                  <option value="title_asc">Título A-Z</option>
                  <option value="title_desc">Título Z-A</option>
                  <option value="property_value_desc">Valor mayor</option>
                  <option value="property_value_asc">Valor menor</option>
                </select>
              </div>
            </div>

            {/* Filtros avanzados */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">💰 Valor mínimo</label>
                    <input
                      type="number"
                      placeholder="50000000"
                      value={filters.minValue || ''}
                      onChange={(e) => 
                        setFilters({ 
                          ...filters, 
                          minValue: e.target.value ? parseFloat(e.target.value) : undefined 
                        })
                      }
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="label">💰 Valor máximo</label>
                    <input
                      type="number"
                      placeholder="200000000"
                      value={filters.maxValue || ''}
                      onChange={(e) => 
                        setFilters({ 
                          ...filters, 
                          maxValue: e.target.value ? parseFloat(e.target.value) : undefined 
                        })
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">🛏️ Dormitorios</label>
                    <select
                      value={filters.bedrooms || ''}
                      onChange={(e) => 
                        setFilters({ 
                          ...filters, 
                          bedrooms: e.target.value ? parseInt(e.target.value) : undefined 
                        })
                      }
                      className="input"
                    >
                      <option value="">Cualquier cantidad</option>
                      <option value="1">1 dormitorio</option>
                      <option value="2">2 dormitorios</option>
                      <option value="3">3 dormitorios</option>
                      <option value="4">4+ dormitorios</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">⏳ Cargando análisis...</div>
          </div>
        ) : error ? (
          <div className="card">
            <div className="card-body text-center">
              <div className="text-red-500 text-lg mb-2">❌ Error</div>
              <p className="text-gray-600">{error}</p>
              <button 
                onClick={() => loadAnalyses()} 
                className="btn btn-primary mt-4"
              >
                🔄 Reintentar
              </button>
            </div>
          </div>
        ) : analyses.length === 0 ? (
          <div className="card">
            <div className="card-body text-center">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay análisis</h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.status 
                  ? 'No se encontraron análisis con los filtros seleccionados.' 
                  : 'Aún no has creado ningún análisis de rentabilidad.'
                }
              </p>
              <Link href="/analisis-precio" className="btn btn-primary">
                ✨ Crear Primer Análisis
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="card hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    {/* Encabezado de la tarjeta */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                          {analysis.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          📍 {analysis.property.address}
                        </p>
                      </div>
                      <div className="ml-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[analysis.metadata.status]}`}>
                          {statusLabels[analysis.metadata.status]}
                        </span>
                      </div>
                    </div>

                    {/* Información de la propiedad */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">💰 Valor:</span>
                        <span className="font-semibold">{formatCurrency(analysis.property.value_clp)}</span>
                      </div>
                      
                      {analysis.analysis.suggested_rent_clp && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">🏠 Arriendo:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(analysis.analysis.suggested_rent_clp)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">📐 Tamaño:</span>
                        <span>{analysis.property.size_m2}m² • {analysis.property.bedrooms}D/{analysis.property.bathrooms}B</span>
                      </div>

                      {analysis.calculations.cap_rate > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">📊 Cap Rate:</span>
                          <span className="font-semibold text-blue-600">{analysis.calculations.cap_rate.toFixed(2)}%</span>
                        </div>
                      )}
                    </div>

                    {/* Metadatos */}
                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      <div>📅 Actualizado: {formatDate(analysis.metadata.updated_at)}</div>
                      {analysis.metadata.tags && analysis.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {analysis.metadata.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-0.5 bg-gray-100 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <Link 
                        href={`/analisis-precio?id=${analysis.id}`}
                        className="btn btn-primary text-sm flex-1 mr-2"
                      >
                        👁️ Ver Detalles
                      </Link>
                      
                      <div className="flex items-center space-x-1">
                        {analysis.metadata.status === 'draft' && (
                          <button
                            onClick={() => updateAnalysisStatus(analysis.id, 'sent_to_client')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Enviar al cliente"
                          >
                            📨
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteAnalysis(analysis.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar análisis"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  ← Anterior
                </button>
                
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}