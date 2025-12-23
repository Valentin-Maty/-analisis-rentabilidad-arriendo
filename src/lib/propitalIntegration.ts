/*
Domain: Propital Integration
Responsibility: Integración con el módulo de arriendo existente de Propital
Dependencies: API endpoints, tipos de datos de Propital
*/

import type { RentalAnalysis } from '@/types/rental'

// Tipos para la integración con Propital
export interface PropitalProperty {
  id: string
  address: string
  owner_id: string
  broker_id: string
  value_clp: number
  value_uf?: number
  size_m2?: number
  bedrooms?: number
  bathrooms?: number
  parking_spaces?: number
  storage_units?: number
  status: 'draft' | 'published' | 'rented' | 'archived'
  created_at: Date
  updated_at: Date
}

export interface PropitalRentalAnalysis {
  id: string
  property_id: string
  broker_id: string
  client_id?: string
  analysis_data: RentalAnalysis
  status: 'draft' | 'sent_to_client' | 'client_responded' | 'published' | 'archived'
  created_at: Date
  updated_at: Date
  expires_at: Date
  client_response?: {
    selected_plans: string[]
    signature_data?: string
    response_date: Date
    notes?: string
  }
}

export interface PropitalBroker {
  id: string
  name: string
  email: string
  phone: string
  company: string
  profile_image?: string
}

// Configuración de endpoints de Propital
const PROPITAL_API_BASE = process.env.NEXT_PUBLIC_PROPITAL_API_URL || 'https://api.propital.com/v1'
const PROPITAL_API_KEY = process.env.PROPITAL_API_KEY

// Headers comunes para requests
const getHeaders = () => ({
  'Authorization': `Bearer ${PROPITAL_API_KEY}`,
  'Content-Type': 'application/json',
})

/**
 * Obtiene las propiedades del broker desde Propital
 */
export async function getBrokerProperties(brokerId: string): Promise<PropitalProperty[]> {
  try {
    const response = await fetch(`${PROPITAL_API_BASE}/brokers/${brokerId}/properties`, {
      headers: getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error(`Error fetching properties: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching broker properties:', error)
    // Retornar datos simulados para desarrollo
    return getMockBrokerProperties(brokerId)
  }
}

/**
 * Obtiene los análisis de rentabilidad del broker desde Propital
 */
export async function getBrokerAnalyses(brokerId: string): Promise<PropitalRentalAnalysis[]> {
  try {
    const response = await fetch(`${PROPITAL_API_BASE}/brokers/${brokerId}/rental-analyses`, {
      headers: getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error(`Error fetching analyses: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching broker analyses:', error)
    return []
  }
}

/**
 * Guarda un análisis de rentabilidad en Propital
 */
export async function saveToPropital(analysis: RentalAnalysis, brokerId: string, propertyId?: string): Promise<PropitalRentalAnalysis> {
  try {
    const payload = {
      property_id: propertyId,
      broker_id: brokerId,
      analysis_data: analysis,
      status: 'draft',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    }

    const response = await fetch(`${PROPITAL_API_BASE}/rental-analyses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })
    
    if (!response.ok) {
      throw new Error(`Error saving to Propital: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error saving to Propital:', error)
    throw error
  }
}

/**
 * Actualiza el estado de un análisis en Propital
 */
export async function updateAnalysisStatus(
  analysisId: string, 
  status: PropitalRentalAnalysis['status'],
  clientResponse?: PropitalRentalAnalysis['client_response']
): Promise<PropitalRentalAnalysis> {
  try {
    const response = await fetch(`${PROPITAL_API_BASE}/rental-analyses/${analysisId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        status,
        client_response: clientResponse,
        updated_at: new Date(),
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Error updating analysis: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating analysis status:', error)
    throw error
  }
}

/**
 * Envía un análisis al cliente a través de Propital
 */
export async function sendAnalysisToClient(
  analysisId: string,
  clientEmail: string,
  clientName: string,
  customMessage?: string
): Promise<{ success: boolean; message: string; trackingId?: string }> {
  try {
    const response = await fetch(`${PROPITAL_API_BASE}/rental-analyses/${analysisId}/send`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        client_email: clientEmail,
        client_name: clientName,
        custom_message: customMessage,
        send_via: 'email',
        include_pdf: true,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Error sending analysis: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // Actualizar estado del análisis
    await updateAnalysisStatus(analysisId, 'sent_to_client')
    
    return {
      success: true,
      message: 'Análisis enviado exitosamente al cliente',
      trackingId: result.tracking_id,
    }
  } catch (error) {
    console.error('Error sending analysis to client:', error)
    return {
      success: false,
      message: `Error al enviar análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    }
  }
}

/**
 * Obtiene información del broker desde Propital
 */
export async function getBrokerInfo(brokerId: string): Promise<PropitalBroker | null> {
  try {
    const response = await fetch(`${PROPITAL_API_BASE}/brokers/${brokerId}`, {
      headers: getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error(`Error fetching broker info: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching broker info:', error)
    return getMockBrokerInfo(brokerId)
  }
}

/**
 * Sincroniza datos locales con Propital
 */
export async function syncWithPropital(brokerId: string): Promise<{
  properties: PropitalProperty[]
  analyses: PropitalRentalAnalysis[]
  lastSync: Date
}> {
  try {
    const [properties, analyses] = await Promise.all([
      getBrokerProperties(brokerId),
      getBrokerAnalyses(brokerId),
    ])
    
    return {
      properties,
      analyses,
      lastSync: new Date(),
    }
  } catch (error) {
    console.error('Error syncing with Propital:', error)
    throw error
  }
}

// Datos simulados para desarrollo
function getMockBrokerProperties(brokerId: string): PropitalProperty[] {
  return [
    {
      id: 'prop-1',
      address: 'Av. Providencia 1234, Las Condes',
      owner_id: 'owner-1',
      broker_id: brokerId,
      value_clp: 95000000,
      value_uf: 2500,
      size_m2: 75,
      bedrooms: 2,
      bathrooms: 2,
      parking_spaces: 1,
      storage_units: 1,
      status: 'draft',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-20'),
    },
    {
      id: 'prop-2',
      address: 'Av. Las Condes 456, Las Condes',
      owner_id: 'owner-2',
      broker_id: brokerId,
      value_clp: 120000000,
      value_uf: 3200,
      size_m2: 90,
      bedrooms: 3,
      bathrooms: 2,
      parking_spaces: 2,
      storage_units: 1,
      status: 'published',
      created_at: new Date('2024-01-10'),
      updated_at: new Date('2024-01-25'),
    },
  ]
}

function getMockBrokerInfo(brokerId: string): PropitalBroker {
  return {
    id: brokerId,
    name: 'María González',
    email: 'maria.gonzalez@propital.com',
    phone: '+56 9 1234 5678',
    company: 'Propital Corredores',
    profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b332e234?w=150',
  }
}

// Utilidades para transformar datos
export function transformToRentalAnalysis(propitalAnalysis: PropitalRentalAnalysis): RentalAnalysis {
  return propitalAnalysis.analysis_data
}

export function transformToFormData(property: PropitalProperty): Partial<any> {
  return {
    property_address: property.address,
    property_value_clp: property.value_clp.toString(),
    property_value_uf: property.value_uf?.toString() || '',
    property_size_m2: property.size_m2?.toString() || '',
    bedrooms: property.bedrooms?.toString() || '1',
    bathrooms: property.bathrooms?.toString() || '1',
    parking_spaces: property.parking_spaces?.toString() || '0',
    storage_units: property.storage_units?.toString() || '0',
  }
}

// Validaciones
export function validatePropitalConnection(): boolean {
  return !!(PROPITAL_API_KEY && PROPITAL_API_BASE)
}

export function isPropitalIntegrationEnabled(): boolean {
  return validatePropitalConnection() && process.env.NEXT_PUBLIC_ENABLE_PROPITAL_INTEGRATION === 'true'
}