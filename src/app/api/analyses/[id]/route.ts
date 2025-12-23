import { NextRequest, NextResponse } from 'next/server';
import { SavedAnalysis, SavedAnalysisFormData, formDataToSavedAnalysis } from '@/types/saved-analysis';
import { getAnalysisById, saveAnalysis, deleteAnalysis, updateAnalysis } from '@/lib/analysisStore';

// GET - Obtener un análisis específico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de análisis requerido' },
        { status: 400 }
      );
    }

    const analysis = getAnalysisById(id);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un análisis existente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const formData: SavedAnalysisFormData = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de análisis requerido' },
        { status: 400 }
      );
    }

    // Validación básica
    if (!formData.title || !formData.property_address || !formData.property_value_clp) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: título, dirección y valor de la propiedad' },
        { status: 400 }
      );
    }

    const existingAnalysis = getAnalysisById(id);

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    // Convertir datos del formulario a análisis guardado
    const updatedAnalysisData = formDataToSavedAnalysis(formData, existingAnalysis.calculations);

    // Actualizar análisis manteniendo algunos metadatos
    const updatedAnalysis: SavedAnalysis = {
      id: existingAnalysis.id,
      ...updatedAnalysisData,
      metadata: {
        ...existingAnalysis.metadata,
        updated_at: new Date().toISOString(),
        broker_email: formData.broker_email || existingAnalysis.metadata.broker_email,
        tags: formData.tags || existingAnalysis.metadata.tags,
        notes: formData.notes !== undefined ? formData.notes : existingAnalysis.metadata.notes,
      },
    };

    // Guardar la actualización
    saveAnalysis(updatedAnalysis);

    return NextResponse.json({
      success: true,
      analysis: updatedAnalysis,
      message: 'Análisis actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating analysis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un análisis
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de análisis requerido' },
        { status: 400 }
      );
    }

    const analysis = getAnalysisById(id);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos (en una app real, verificar que el broker sea el propietario)
    // Opcional: verificar que el análisis no esté en un estado que impida eliminarlo
    if (analysis.metadata.status === 'published') {
      return NextResponse.json(
        { error: 'No se puede eliminar un análisis publicado. Primero archívalo.' },
        { status: 403 }
      );
    }

    // Eliminar análisis
    const deleted = deleteAnalysis(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Error al eliminar el análisis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Análisis eliminado exitosamente',
      deletedAnalysis: {
        id: analysis.id,
        title: analysis.title,
        property: {
          address: analysis.property.address
        }
      }
    });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar estado o campos específicos
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de análisis requerido' },
        { status: 400 }
      );
    }

    const existingAnalysis = getAnalysisById(id);

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    // Permitir actualización de campos específicos
    const allowedUpdates = ['status', 'tags', 'notes', 'title'];
    const updates: Partial<SavedAnalysis> = {};

    for (const [key, value] of Object.entries(body)) {
      if (allowedUpdates.includes(key)) {
        if (key === 'status' || key === 'tags' || key === 'notes') {
          updates.metadata = {
            ...existingAnalysis.metadata,
            [key]: value,
            updated_at: new Date().toISOString(),
          };
        } else if (key === 'title') {
          updates.title = value as string;
        }
      }
    }

    // Actualizar análisis
    const updatedAnalysis: SavedAnalysis = {
      ...existingAnalysis,
      ...updates,
      metadata: {
        ...existingAnalysis.metadata,
        ...updates.metadata,
        updated_at: new Date().toISOString(),
      },
    };

    saveAnalysis(updatedAnalysis);

    return NextResponse.json({
      success: true,
      analysis: updatedAnalysis,
      message: 'Análisis actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error patching analysis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}