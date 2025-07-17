/**
 * @module @adonisjs/turbo-validation
 *
 * This module provides a clean, structured package for handling server validation errors
 * with Turbo Stream integration. It encapsulates all validation error handling logic,
 * provides a fluent API for common validation scenarios, and is structured for easy
 * extraction as a standalone package.
 */

// Export main ValidationManager class
export { ValidationManager } from './validation_manager.js'

// Export utility classes
export { ErrorExtractor } from './error_extractor.js'
export { FieldMapper } from './field_mapper.js'

// Export all types
export type {
  ValidationError,
  ValidationManagerConfig,
  FieldMappingRule,
  FieldMapper as FieldMapperType,
  ErrorTransform,
  ValidationErrorHandler,
  ValidationManager as ValidationManagerInterface,
} from './types.js'

/**
 * Default export for convenient importing
 */
import { ValidationManager } from './validation_manager.js'
export default ValidationManager
