/**
 * Core validation error interface representing a single field validation error
 */
export interface ValidationError {
  field: string
  message: string
  rule?: string
}

/**
 * Configuration options for ValidationManager behavior
 */
export interface ValidationManagerConfig {
  customFieldMapper?: FieldMapper
  errorTransform?: ErrorTransform
  fallbackBehavior?: 'flash' | 'throw' | 'silent'
}

/**
 * Rule for mapping field names to input IDs
 */
export interface FieldMappingRule {
  pattern: RegExp
  replacement: string
}

/**
 * Function type for mapping field names to input IDs
 */
export type FieldMapper = (fieldName: string) => string

/**
 * Function type for transforming validation errors
 */
export type ErrorTransform = (error: ValidationError) => ValidationError

/**
 * Function type for handling validation errors
 */
export type ValidationErrorHandler = (error: unknown) => Promise<string>

/**
 * HttpContext extension to include ValidationManager
 */
declare module '@adonisjs/core/http' {
  interface HttpContext {
    validationManager: ValidationManager
  }
}

/**
 * Forward declaration of ValidationManager class for HttpContext extension
 */
export interface ValidationManager {
  handleValidationError(error: unknown): Promise<string>
  isValidationError(error: unknown): boolean
  isTurboEnabled(): boolean
  addFieldError(fieldName: string, message: string): ValidationManager
  withCustomMapping(mapper: FieldMapper): ValidationManager
  withErrorTransform(transform: ErrorTransform): ValidationManager
}
