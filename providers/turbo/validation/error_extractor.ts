import { ValidationError } from './types.js'

/**
 * ErrorExtractor class responsible for extracting validation errors from different error formats
 *
 * This class handles various VineJS error structures and provides robust error parsing with fallback handling
 */
export class ErrorExtractor {
  /**
   * Extract validation errors from an unknown error object
   *
   * @param error The error object to extract validation errors from
   * @returns Array of ValidationError objects
   */
  extractValidationErrors(error: unknown): ValidationError[] {
    // Ensure error is an object
    if (!error || typeof error !== 'object') {
      return []
    }

    // Try different extraction methods based on error structure
    if (this.isVineJSError(error)) {
      return this.extractFromVineJS(error)
    }

    // Fallback to generic extraction if specific format not detected
    return this.extractFromGenericError(error)
  }

  /**
   * Check if the error is a VineJS validation error
   *
   * @param error The error object to check
   * @returns boolean indicating if the error is a VineJS validation error
   */
  isVineJSError(error: unknown): boolean {
    return (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'E_VALIDATION_ERROR'
    )
  }

  /**
   * Extract validation errors from a VineJS error object
   *
   * @param error The VineJS error object
   * @returns Array of ValidationError objects
   */
  private extractFromVineJS(error: any): ValidationError[] {
    // Try different VineJS error structures
    if (error.messages && Array.isArray(error.messages)) {
      return this.extractFromMessages(error.messages)
    }

    if (error.errors && Array.isArray(error.errors)) {
      return this.extractFromMessages(error.errors)
    }

    if (error.message && typeof error.message === 'object') {
      return this.extractFromErrorObject(error.message)
    }

    // Fallback for unknown VineJS error structure
    return []
  }

  /**
   * Extract validation errors from an array of message objects
   *
   * @param messages Array of message objects with field and message properties
   * @returns Array of ValidationError objects
   */
  private extractFromMessages(messages: any[]): ValidationError[] {
    const errors: ValidationError[] = []

    for (const message of messages) {
      if (message && typeof message === 'object' && 'field' in message && 'message' in message) {
        errors.push({
          field: message.field,
          message: message.message,
          rule: message.rule || undefined,
        })
      }
    }

    return errors
  }

  /**
   * Extract validation errors from an error object with field keys
   *
   * @param errorObj Error object with field names as keys
   * @returns Array of ValidationError objects
   */
  private extractFromErrorObject(errorObj: any): ValidationError[] {
    const errors: ValidationError[] = []

    for (const [field, messages] of Object.entries(errorObj)) {
      if (Array.isArray(messages)) {
        for (const msg of messages) {
          errors.push({
            field,
            message: typeof msg === 'string' ? msg : msg.message || String(msg),
            rule: typeof msg === 'object' && msg.rule ? msg.rule : undefined,
          })
        }
      } else if (typeof messages === 'string') {
        errors.push({
          field,
          message: messages,
        })
      }
    }

    return errors
  }

  /**
   * Extract validation errors from a generic error object
   * Attempts to find validation-like structures in unknown error formats
   *
   * @param error Generic error object
   * @returns Array of ValidationError objects
   */
  private extractFromGenericError(error: any): ValidationError[] {
    // Try to find validation errors in common error structures

    // Check for errors property that might contain validation errors
    if (error.errors && typeof error.errors === 'object') {
      if (Array.isArray(error.errors)) {
        return this.extractFromMessages(error.errors)
      } else {
        return this.extractFromErrorObject(error.errors)
      }
    }

    // Check for details property that might contain validation errors
    if (error.details && typeof error.details === 'object') {
      if (Array.isArray(error.details)) {
        return this.extractFromMessages(error.details)
      } else {
        return this.extractFromErrorObject(error.details)
      }
    }

    // Check if the error itself has a structure like { fieldName: ['error message'] }
    if (this.looksLikeValidationErrorObject(error)) {
      return this.extractFromErrorObject(error)
    }

    return []
  }

  /**
   * Check if an object looks like a validation error object
   * with field names as keys and error messages as values
   *
   * @param obj Object to check
   * @returns boolean indicating if the object looks like a validation error object
   */
  private looksLikeValidationErrorObject(obj: any): boolean {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return false
    }

    // Check if at least one property has an array or string value
    // which is common for validation error objects
    for (const key in obj) {
      const value = obj[key]
      if (Array.isArray(value) || typeof value === 'string') {
        return true
      }
      if (typeof value === 'object' && value !== null && 'message' in value) {
        return true
      }
    }

    return false
  }
}
