/*
Domain: Error Handling
Responsibility: Manejo centralizado de errores y logging
Dependencies: Configuración, notificaciones
*/

import React from 'react'

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  API = 'API',
  AUTHENTICATION = 'AUTH',
  PERMISSION = 'PERMISSION',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  CONFIGURATION = 'CONFIGURATION',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError {
  id: string
  type: ErrorType
  severity: ErrorSeverity
  message: string
  userMessage?: string
  details?: Record<string, any>
  timestamp: Date
  stack?: string
  context?: {
    userId?: string
    component?: string
    action?: string
    url?: string
  }
}

interface ErrorHandler {
  handle(error: AppError): void
  notify(error: AppError): void
  log(error: AppError): void
}

class ConsoleErrorHandler implements ErrorHandler {
  handle(error: AppError): void {
    this.log(error)
    this.notify(error)
  }

  log(error: AppError): void {
    const prefix = this.getLogPrefix(error.severity)
    const message = `${prefix} [${error.type}] ${error.message}`
    
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error(message, error)
        break
      case ErrorSeverity.MEDIUM:
        console.warn(message, error)
        break
      case ErrorSeverity.LOW:
      default:
        console.info(message, error)
        break
    }
  }

  notify(error: AppError): void {
    // En desarrollo, usar toast si está disponible
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const toast = (window as any).showToast
      if (toast && error.userMessage) {
        const type = this.getToastType(error.severity)
        toast({
          type,
          title: this.getErrorTitle(error.type),
          message: error.userMessage,
          duration: this.getToastDuration(error.severity)
        })
      }
    }
  }

  private getLogPrefix(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return '🚨'
      case ErrorSeverity.HIGH:
        return '❌'
      case ErrorSeverity.MEDIUM:
        return '⚠️'
      case ErrorSeverity.LOW:
        return 'ℹ️'
      default:
        return '📝'
    }
  }

  private getToastType(severity: ErrorSeverity): 'error' | 'warning' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error'
      case ErrorSeverity.MEDIUM:
        return 'warning'
      case ErrorSeverity.LOW:
      default:
        return 'info'
    }
  }

  private getErrorTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.VALIDATION:
        return 'Error de Validación'
      case ErrorType.NETWORK:
        return 'Error de Conexión'
      case ErrorType.API:
        return 'Error del Servidor'
      case ErrorType.AUTHENTICATION:
        return 'Error de Autenticación'
      case ErrorType.PERMISSION:
        return 'Sin Permisos'
      case ErrorType.BUSINESS_LOGIC:
        return 'Error de Procesamiento'
      case ErrorType.EXTERNAL_SERVICE:
        return 'Servicio No Disponible'
      case ErrorType.CONFIGURATION:
        return 'Error de Configuración'
      default:
        return 'Error Inesperado'
    }
  }

  private getToastDuration(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 10000
      case ErrorSeverity.HIGH:
        return 8000
      case ErrorSeverity.MEDIUM:
        return 6000
      case ErrorSeverity.LOW:
      default:
        return 4000
    }
  }
}

// Singleton error handler
class ErrorManager {
  private static instance: ErrorManager
  private handlers: ErrorHandler[] = []
  private errorHistory: AppError[] = []
  private maxHistorySize = 100

  private constructor() {
    this.handlers.push(new ConsoleErrorHandler())
  }

  public static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager()
    }
    return ErrorManager.instance
  }

  public addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler)
  }

  public handleError(error: Error | AppError | string, context?: Partial<AppError>): void {
    const appError = this.normalizeError(error, context)
    
    // Agregar al historial
    this.errorHistory.unshift(appError)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.pop()
    }

    // Procesar con todos los handlers
    this.handlers.forEach(handler => {
      try {
        handler.handle(appError)
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    })
  }

  public getErrorHistory(): AppError[] {
    return [...this.errorHistory]
  }

  public clearHistory(): void {
    this.errorHistory = []
  }

  private normalizeError(error: Error | AppError | string, context?: Partial<AppError>): AppError {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const timestamp = new Date()

    if (typeof error === 'string') {
      return {
        id,
        type: context?.type || ErrorType.UNKNOWN,
        severity: context?.severity || ErrorSeverity.MEDIUM,
        message: error,
        userMessage: context?.userMessage || error,
        timestamp,
        context: context?.context
      }
    }

    if ('type' in error && 'severity' in error) {
      // Ya es un AppError
      return { ...error, id, timestamp }
    }

    // Es un Error nativo de JavaScript
    const jsError = error as Error
    return {
      id,
      type: this.inferErrorType(jsError),
      severity: context?.severity || ErrorSeverity.HIGH,
      message: jsError.message,
      userMessage: context?.userMessage || 'Ha ocurrido un error inesperado',
      details: {
        name: jsError.name,
        stack: jsError.stack
      },
      stack: jsError.stack,
      timestamp,
      context: context?.context
    }
  }

  private inferErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    if (name.includes('network') || message.includes('fetch') || message.includes('network')) {
      return ErrorType.NETWORK
    }
    
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return ErrorType.VALIDATION
    }

    if (name.includes('unauthorized') || message.includes('auth')) {
      return ErrorType.AUTHENTICATION
    }

    if (message.includes('permission') || message.includes('forbidden')) {
      return ErrorType.PERMISSION
    }

    if (message.includes('api') || message.includes('server')) {
      return ErrorType.API
    }

    return ErrorType.UNKNOWN
  }
}

// Funciones de utilidad para el manejo de errores
export const errorManager = ErrorManager.getInstance()

export function handleError(
  error: Error | string, 
  type?: ErrorType,
  severity?: ErrorSeverity,
  userMessage?: string,
  context?: AppError['context']
): void {
  errorManager.handleError(error, {
    type,
    severity,
    userMessage,
    context
  })
}

export function handleApiError(
  error: Error | string,
  endpoint?: string,
  userMessage?: string
): void {
  handleError(error, ErrorType.API, ErrorSeverity.HIGH, userMessage, {
    action: 'API_CALL',
    url: endpoint
  })
}

export function handleValidationError(
  message: string,
  field?: string,
  component?: string
): void {
  handleError(message, ErrorType.VALIDATION, ErrorSeverity.MEDIUM, message, {
    component,
    action: 'VALIDATION',
    details: { field }
  })
}

export function handleNetworkError(
  error: Error | string,
  url?: string,
  userMessage: string = 'Error de conexión. Por favor, verifique su conexión a internet.'
): void {
  handleError(error, ErrorType.NETWORK, ErrorSeverity.HIGH, userMessage, {
    action: 'NETWORK_REQUEST',
    url
  })
}

export function handleExternalServiceError(
  serviceName: string,
  error: Error | string,
  userMessage?: string
): void {
  const defaultMessage = `El servicio ${serviceName} no está disponible en este momento. Por favor, intente más tarde.`
  handleError(error, ErrorType.EXTERNAL_SERVICE, ErrorSeverity.MEDIUM, userMessage || defaultMessage, {
    action: 'EXTERNAL_SERVICE',
    details: { service: serviceName }
  })
}

// Decorador para manejo automático de errores en funciones async
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorType: ErrorType = ErrorType.UNKNOWN,
  userMessage?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      handleError(error as Error, errorType, ErrorSeverity.HIGH, userMessage)
      throw error // Re-throw para que la función caller pueda manejar el error también
    }
  }) as T
}

// React Error Boundary helper
export function createErrorBoundary() {
  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      handleError(error, ErrorType.UNKNOWN, ErrorSeverity.HIGH, 'Error en la aplicación', {
        component: 'ErrorBoundary',
        details: { errorInfo }
      })
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🚨</div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  Error en la aplicación
                </h1>
                <p className="text-gray-600 mb-4">
                  Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Recargar página
                </button>
              </div>
            </div>
          </div>
        )
      }

      return this.props.children
    }
  }
}

export default errorManager