// Tipos para el sistema de internacionalización

export interface LocaleStrings {
  common: {
    loading: string
    save: string
    cancel: string
    confirm: string
    delete: string
    edit: string
    back: string
    next: string
    previous: string
    close: string
    search: string
    filter: string
    export: string
    import: string
    yes: string
    no: string
    error: string
    success: string
    warning: string
    info: string
    required: string
    optional: string
  }
  navigation: {
    home: string
    analysis: string
    analyses: string
    settings: string
    profile: string
    logout: string
    newAnalysis: string
    savedAnalyses: string
    help: string
  }
  property: Record<string, string>
  analysis: Record<string, string>
  plans: Record<string, string>
  errors: Record<string, string>
  messages: Record<string, string>
  forms: Record<string, string>
  units: Record<string, string>
  status: Record<string, string>
}

export type Locale = LocaleStrings