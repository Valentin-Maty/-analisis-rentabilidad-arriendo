import { NextRequest, NextResponse } from 'next/server';
import { SavedAnalysis, AnalysisFilters, AnalysisListResponse, SavedAnalysisFormData, formDataToSavedAnalysis } from '@/types/saved-analysis';
import { getAllAnalyses, saveAnalysis } from '@/lib/analysisStore';
import { AnalysisStorage } from '@/lib/localStorage';
import { validatePagination, validateRentalAnalysis, ValidationResult } from '@/lib/validation';
import { handleApiError } from '@/lib/errorHandler';

// GET - Obtener análisis con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validar parámetros de paginación
    const paginationData = {
      page: searchParams.get('page'),
      limit: searchParams.get('pageSize') || searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder')
    };

    const paginationValidation = validatePagination(paginationData);
    if (!paginationValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters', details: paginationValidation.errors },
        { status: 400 }
      );
    }

    const { page, limit: pageSize, sortBy, sortOrder } = paginationValidation.data!;
    
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
      sortBy: (sortBy as AnalysisFilters['sortBy']) || 'updated_at',
      sortOrder: (sortOrder as AnalysisFilters['sortOrder']) || 'desc',
    };

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
      let aValue: string | number | Date, bValue: string | number | Date;

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
    return handleApiError(error, 'GET /api/analyses', 'Error al obtener análisis');
  }
}

// POST - Crear un nuevo análisis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar estructura de datos con validador especializado
    const validation = validateRentalAnalysis(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Datos de análisis inválidos', details: validation.errors },
        { status: 400 }
      );
    }

    const formData: SavedAnalysisFormData = body;

    // Validaciones adicionales de campos requeridos para guardado
    if (!formData.title || formData.title.trim().length < 3) {
      return NextResponse.json(
        { error: 'El título debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    if (!formData.broker_email) {
      return NextResponse.json(
        { error: 'Email del corredor es requerido' },
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
    return handleApiError(error, 'POST /api/analyses', 'Error al guardar análisis');
  }
}