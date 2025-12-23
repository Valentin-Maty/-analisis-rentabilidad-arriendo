// Tipos para análisis guardados de rentabilidad

export interface SavedAnalysis {
  id: string;
  title: string; // Nombre personalizado del análisis
  property: {
    address: string;
    value_clp: number;
    value_uf?: number;
    size_m2: number;
    bedrooms: number;
    bathrooms: number;
    parking_spaces: number;
    storage_units: number;
  };
  analysis: {
    suggested_rent_clp?: number;
    suggested_rent_uf?: number;
    rent_currency: 'CLP' | 'UF';
    capture_price_clp?: number;
    capture_price_uf?: number;
    capture_price_currency?: 'CLP' | 'UF';
    comparable_properties: Array<{
      address?: string;
      size_m2?: number;
      bedrooms?: number;
      bathrooms?: number;
      parking_spaces?: number;
      storage_units?: number;
      rent_clp?: number;
    }>;
    annual_expenses: {
      maintenance_clp: number;
      property_tax_clp: number;
      insurance_clp: number;
    };
    uf_value_clp: number;
  };
  calculations: {
    cap_rate: number;
    annual_rental_yield: number;
    monthly_net_income: number;
    vacancy_cost_per_month: number;
    break_even_rent_reduction: number;
    plan_comparisons: Array<{
      plan_id: 'A' | 'B' | 'C';
      expected_rental_time: number;
      total_commission: number;
      net_annual_income: number;
      vacancy_risk_score: number;
      recommendation_score: number;
    }>;
  };
  metadata: {
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    broker_email: string;
    status: 'draft' | 'sent_to_client' | 'client_responded' | 'published' | 'archived';
    tags?: string[]; // Para categorización
    notes?: string; // Notas adicionales del broker
  };
}

export interface SavedAnalysisFormData {
  title: string;
  property_address: string;
  property_value_clp: string;
  property_value_uf?: string;
  property_size_m2: string;
  bedrooms: string;
  bathrooms: string;
  parking_spaces: string;
  storage_units: string;
  suggested_rent_clp?: string;
  suggested_rent_uf?: string;
  rent_currency: 'CLP' | 'UF';
  capture_price_clp?: string;
  capture_price_uf?: string;
  capture_price_currency?: 'CLP' | 'UF';
  comparable_1_address?: string;
  comparable_1_m2?: string;
  comparable_1_bedrooms?: string;
  comparable_1_bathrooms?: string;
  comparable_1_parking?: string;
  comparable_1_storage?: string;
  comparable_1_price?: string;
  comparable_2_address?: string;
  comparable_2_m2?: string;
  comparable_2_bedrooms?: string;
  comparable_2_bathrooms?: string;
  comparable_2_parking?: string;
  comparable_2_storage?: string;
  comparable_2_price?: string;
  comparable_3_address?: string;
  comparable_3_m2?: string;
  comparable_3_bedrooms?: string;
  comparable_3_bathrooms?: string;
  comparable_3_parking?: string;
  comparable_3_storage?: string;
  comparable_3_price?: string;
  annual_maintenance_clp: string;
  annual_property_tax_clp: string;
  annual_insurance_clp: string;
  uf_value_clp: string;
  broker_email: string;
  notes?: string;
  tags?: string[];
}

// Filtros para la búsqueda de análisis
export interface AnalysisFilters {
  search?: string; // Búsqueda en dirección o título
  status?: SavedAnalysis['metadata']['status'];
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  minValue?: number;
  maxValue?: number;
  bedrooms?: number;
  bathrooms?: number;
  tags?: string[];
  sortBy?: 'created_at' | 'updated_at' | 'property_value' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Respuesta de la API para listado de análisis
export interface AnalysisListResponse {
  analyses: SavedAnalysis[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Utilidades para conversión de tipos
export function formDataToSavedAnalysis(
  formData: SavedAnalysisFormData,
  calculations?: SavedAnalysis['calculations']
): Omit<SavedAnalysis, 'id' | 'metadata'> {
  return {
    title: formData.title,
    property: {
      address: formData.property_address,
      value_clp: parseFloat(formData.property_value_clp),
      value_uf: formData.property_value_uf ? parseFloat(formData.property_value_uf) : undefined,
      size_m2: parseFloat(formData.property_size_m2),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      parking_spaces: parseInt(formData.parking_spaces || '0'),
      storage_units: parseInt(formData.storage_units || '0'),
    },
    analysis: {
      suggested_rent_clp: formData.suggested_rent_clp ? parseFloat(formData.suggested_rent_clp) : undefined,
      suggested_rent_uf: formData.suggested_rent_uf ? parseFloat(formData.suggested_rent_uf) : undefined,
      rent_currency: formData.rent_currency,
      capture_price_clp: formData.capture_price_clp ? parseFloat(formData.capture_price_clp) : undefined,
      capture_price_uf: formData.capture_price_uf ? parseFloat(formData.capture_price_uf) : undefined,
      capture_price_currency: formData.capture_price_currency,
      comparable_properties: [
        {
          address: formData.comparable_1_address,
          size_m2: formData.comparable_1_m2 ? parseFloat(formData.comparable_1_m2) : undefined,
          bedrooms: formData.comparable_1_bedrooms ? parseInt(formData.comparable_1_bedrooms) : undefined,
          bathrooms: formData.comparable_1_bathrooms ? parseInt(formData.comparable_1_bathrooms) : undefined,
          parking_spaces: formData.comparable_1_parking ? parseInt(formData.comparable_1_parking) : undefined,
          storage_units: formData.comparable_1_storage ? parseInt(formData.comparable_1_storage) : undefined,
          rent_clp: formData.comparable_1_price ? parseFloat(formData.comparable_1_price) : undefined,
        },
        {
          address: formData.comparable_2_address,
          size_m2: formData.comparable_2_m2 ? parseFloat(formData.comparable_2_m2) : undefined,
          bedrooms: formData.comparable_2_bedrooms ? parseInt(formData.comparable_2_bedrooms) : undefined,
          bathrooms: formData.comparable_2_bathrooms ? parseInt(formData.comparable_2_bathrooms) : undefined,
          parking_spaces: formData.comparable_2_parking ? parseInt(formData.comparable_2_parking) : undefined,
          storage_units: formData.comparable_2_storage ? parseInt(formData.comparable_2_storage) : undefined,
          rent_clp: formData.comparable_2_price ? parseFloat(formData.comparable_2_price) : undefined,
        },
        {
          address: formData.comparable_3_address,
          size_m2: formData.comparable_3_m2 ? parseFloat(formData.comparable_3_m2) : undefined,
          bedrooms: formData.comparable_3_bedrooms ? parseInt(formData.comparable_3_bedrooms) : undefined,
          bathrooms: formData.comparable_3_bathrooms ? parseInt(formData.comparable_3_bathrooms) : undefined,
          parking_spaces: formData.comparable_3_parking ? parseInt(formData.comparable_3_parking) : undefined,
          storage_units: formData.comparable_3_storage ? parseInt(formData.comparable_3_storage) : undefined,
          rent_clp: formData.comparable_3_price ? parseFloat(formData.comparable_3_price) : undefined,
        },
      ].filter(comp => comp.address), // Solo incluir comparables con dirección
      annual_expenses: {
        maintenance_clp: parseFloat(formData.annual_maintenance_clp || '0'),
        property_tax_clp: parseFloat(formData.annual_property_tax_clp || '0'),
        insurance_clp: parseFloat(formData.annual_insurance_clp || '0'),
      },
      uf_value_clp: parseFloat(formData.uf_value_clp),
    },
    calculations: calculations || {
      cap_rate: 0,
      annual_rental_yield: 0,
      monthly_net_income: 0,
      vacancy_cost_per_month: 0,
      break_even_rent_reduction: 0,
      plan_comparisons: [],
    },
  };
}

export function savedAnalysisToFormData(analysis: SavedAnalysis): SavedAnalysisFormData {
  return {
    title: analysis.title,
    property_address: analysis.property.address,
    property_value_clp: analysis.property.value_clp.toString(),
    property_value_uf: analysis.property.value_uf?.toString(),
    property_size_m2: analysis.property.size_m2.toString(),
    bedrooms: analysis.property.bedrooms.toString(),
    bathrooms: analysis.property.bathrooms.toString(),
    parking_spaces: analysis.property.parking_spaces.toString(),
    storage_units: analysis.property.storage_units.toString(),
    suggested_rent_clp: analysis.analysis.suggested_rent_clp?.toString(),
    suggested_rent_uf: analysis.analysis.suggested_rent_uf?.toString(),
    rent_currency: analysis.analysis.rent_currency,
    capture_price_clp: analysis.analysis.capture_price_clp?.toString(),
    capture_price_uf: analysis.analysis.capture_price_uf?.toString(),
    capture_price_currency: analysis.analysis.capture_price_currency,
    comparable_1_address: analysis.analysis.comparable_properties[0]?.address,
    comparable_1_m2: analysis.analysis.comparable_properties[0]?.size_m2?.toString(),
    comparable_1_bedrooms: analysis.analysis.comparable_properties[0]?.bedrooms?.toString(),
    comparable_1_bathrooms: analysis.analysis.comparable_properties[0]?.bathrooms?.toString(),
    comparable_1_parking: analysis.analysis.comparable_properties[0]?.parking_spaces?.toString(),
    comparable_1_storage: analysis.analysis.comparable_properties[0]?.storage_units?.toString(),
    comparable_1_price: analysis.analysis.comparable_properties[0]?.rent_clp?.toString(),
    comparable_2_address: analysis.analysis.comparable_properties[1]?.address,
    comparable_2_m2: analysis.analysis.comparable_properties[1]?.size_m2?.toString(),
    comparable_2_bedrooms: analysis.analysis.comparable_properties[1]?.bedrooms?.toString(),
    comparable_2_bathrooms: analysis.analysis.comparable_properties[1]?.bathrooms?.toString(),
    comparable_2_parking: analysis.analysis.comparable_properties[1]?.parking_spaces?.toString(),
    comparable_2_storage: analysis.analysis.comparable_properties[1]?.storage_units?.toString(),
    comparable_2_price: analysis.analysis.comparable_properties[1]?.rent_clp?.toString(),
    comparable_3_address: analysis.analysis.comparable_properties[2]?.address,
    comparable_3_m2: analysis.analysis.comparable_properties[2]?.size_m2?.toString(),
    comparable_3_bedrooms: analysis.analysis.comparable_properties[2]?.bedrooms?.toString(),
    comparable_3_bathrooms: analysis.analysis.comparable_properties[2]?.bathrooms?.toString(),
    comparable_3_parking: analysis.analysis.comparable_properties[2]?.parking_spaces?.toString(),
    comparable_3_storage: analysis.analysis.comparable_properties[2]?.storage_units?.toString(),
    comparable_3_price: analysis.analysis.comparable_properties[2]?.rent_clp?.toString(),
    annual_maintenance_clp: analysis.analysis.annual_expenses.maintenance_clp.toString(),
    annual_property_tax_clp: analysis.analysis.annual_expenses.property_tax_clp.toString(),
    annual_insurance_clp: analysis.analysis.annual_expenses.insurance_clp.toString(),
    uf_value_clp: analysis.analysis.uf_value_clp.toString(),
    broker_email: analysis.metadata.broker_email,
    notes: analysis.metadata.notes,
    tags: analysis.metadata.tags,
  };
}