import { NextRequest, NextResponse } from 'next/server';
import { SavedAnalysis, AnalysisFilters, AnalysisListResponse, SavedAnalysisFormData, formDataToSavedAnalysis } from '@/types/saved-analysis';
import { getAllAnalyses, saveAnalysis } from '@/lib/analysisStore';

// GET - Obtener análisis con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Obtener parámetros de filtro
    const filters: AnalysisFilters = {
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as SavedAnalysis['metadata']['status']) || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      minValue: searchParams.get('minValue') ? parseFloat(searchParams.get('minValue')!) : undefined,
      maxValue: searchParams.get('maxValue') ? parseFloat(searchParams.get('maxValue')!) : undefined,
      bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
      bathrooms: searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      sortBy: (searchParams.get('sortBy') as AnalysisFilters['sortBy']) || 'updated_at',
      sortOrder: (searchParams.get('sortOrder') as AnalysisFilters['sortOrder']) || 'desc',
    };

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // Obtener todos los análisis del store
    let analyses = getAllAnalyses();

    // Aplicar filtros
    let filteredAnalyses = analyses;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredAnalyses = filteredAnalyses.filter(
        (analysis) =>
          analysis.title.toLowerCase().includes(searchLower) ||
          analysis.property.address.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filteredAnalyses = filteredAnalyses.filter(
        (analysis) => analysis.metadata.status === filters.status
      );
    }

    if (filters.minValue) {
      filteredAnalyses = filteredAnalyses.filter(
        (analysis) => analysis.property.value_clp >= filters.minValue!
      );
    }

    if (filters.maxValue) {
      filteredAnalyses = filteredAnalyses.filter(
        (analysis) => analysis.property.value_clp <= filters.maxValue!
      );
    }

    if (filters.bedrooms) {
      filteredAnalyses = filteredAnalyses.filter(
        (analysis) => analysis.property.bedrooms === filters.bedrooms
      );
    }

    if (filters.bathrooms) {
      filteredAnalyses = filteredAnalyses.filter(
        (analysis) => analysis.property.bathrooms === filters.bathrooms
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredAnalyses = filteredAnalyses.filter((analysis) =>
        filters.tags!.some((tag) => analysis.metadata.tags?.includes(tag))
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredAnalyses = filteredAnalyses.filter(
        (analysis) => new Date(analysis.metadata.created_at) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filteredAnalyses = filteredAnalyses.filter(
        (analysis) => new Date(analysis.metadata.created_at) <= toDate
      );
    }

    // Ordenar
    filteredAnalyses.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'property_value':
          aValue = a.property.value_clp;
          bValue = b.property.value_clp;
          break;
        case 'created_at':
          aValue = new Date(a.metadata.created_at);
          bValue = new Date(b.metadata.created_at);
          break;
        case 'updated_at':
        default:
          aValue = new Date(a.metadata.updated_at);
          bValue = new Date(b.metadata.updated_at);
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Paginación
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedAnalyses = filteredAnalyses.slice(startIndex, endIndex);

    const response: AnalysisListResponse = {
      analyses: paginatedAnalyses,
      total: filteredAnalyses.length,
      page,
      pageSize,
      hasMore: endIndex < filteredAnalyses.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo análisis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const formData: SavedAnalysisFormData = body;

    // Validación básica
    if (!formData.title || !formData.property_address || !formData.property_value_clp) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: título, dirección y valor de la propiedad' },
        { status: 400 }
      );
    }

    // Convertir datos del formulario a análisis guardado
    const analysisData = formDataToSavedAnalysis(formData);

    // Crear nuevo análisis con metadatos
    const newAnalysis: SavedAnalysis = {
      id: Date.now().toString(), // En producción usar UUID
      ...analysisData,
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        broker_email: formData.broker_email,
        status: 'draft',
        tags: formData.tags || [],
        notes: formData.notes,
      },
    };

    // Guardar en el store
    saveAnalysis(newAnalysis);

    return NextResponse.json(
      { 
        success: true, 
        analysis: newAnalysis,
        message: 'Análisis guardado exitosamente' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving analysis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}