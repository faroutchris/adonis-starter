import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (error, { view }) => {
      return view.render('pages/errors/not_found', { error })
    },
    '500..599': (error, { view }) => {
      return view.render('pages/errors/server_error', { error })
    },
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    // Check if this is a validation error and if the request is a Turbo Stream request
    console.log(
      'this.isValidationError(error), this.isTurboEnabled(ctx)',
      this.isValidationError(error),
      this.isTurboEnabled(ctx)
    )

    // Handle validation errors for Turbo Stream requests with custom logic
    if (this.isValidationError(error) && this.isTurboEnabled(ctx)) {
      const turbo = await this.handleValidationError(error, ctx)
      return ctx.response.send(turbo)
    }

    // For all other cases (including validation errors in non-Turbo requests),
    // use the default AdonisJS error handling which includes:
    // - Redirecting back with flash messages for validation errors
    // - Rendering error pages for other errors
    // - Maintaining backward compatibility with existing error handling
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }

  /**
   * Check if the error is a VineJS validation error
   */
  private isValidationError(error: unknown): boolean {
    return (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'E_VALIDATION_ERROR'
    )
  }

  /**
   * Check if the request is a Turbo Stream request
   */
  private isTurboEnabled(ctx: HttpContext): boolean {
    const isTurboStream = ctx.turboStream.isTurboStream()
    const isTurboFrame = ctx.turboFrame.isTurboFrame()
    const acceptHeader = ctx.request.header('Accept')

    console.log('Turbo detection:', {
      isTurboStream,
      isTurboFrame,
      acceptHeader,
      result: isTurboStream || isTurboFrame,
    })

    return isTurboStream || isTurboFrame
  }

  /**
   * Handle validation errors for Turbo Stream requests
   */
  private async handleValidationError(error: any, ctx: HttpContext): Promise<string> {
    // Set the appropriate status code for validation errors
    ctx.response.status(422)

    const result = await this.createValidationTurboStream(error, ctx)
    console.log('Turbo stream result:', result)
    console.log('Response headers:', ctx.response.getHeaders())
    console.log('Response status:', ctx.response.getStatus())
    return result
  }

  /**
   * Create validation error response helper that generates Turbo Stream responses
   * with invoke actions for each validation error targeting specific form inputs
   */
  private async createValidationTurboStream(error: any, ctx: HttpContext): Promise<string> {
    // Extract validation errors from the VineJS error
    const validationErrors = this.extractValidationErrors(error)

    // Store the turbo stream instance to avoid creating new instances
    const turboStream = ctx.turboStream

    console.log('Validation errors:', validationErrors)
    console.log('Templates before adding:', turboStream.templates.length)

    // Generate invoke actions for each validation error targeting specific form inputs
    for (const validationError of validationErrors) {
      const inputId = this.mapFieldToInputId(validationError.field)
      console.log(`Adding invoke for field: ${validationError.field} -> #${inputId}`)
      turboStream.invoke(`#${inputId}`, 'serverError', [
        validationError.field,
        validationError.message,
      ])
    }

    console.log('Templates after adding:', turboStream.templates.length)

    // If no validation errors were found, add a generic error message
    if (validationErrors.length === 0) {
      console.log('No validation errors found, adding generic error')
      turboStream.flash('error', 'Validation failed. Please check your input.')
    }

    return turboStream.render()
  }

  /**
   * Extract validation errors from VineJS error object
   */
  private extractValidationErrors(error: any): Array<{ field: string; message: string }> {
    const errors: Array<{ field: string; message: string }> = []

    console.log('Full error object:', JSON.stringify(error, null, 2))

    // VineJS validation errors have different possible structures
    if (error.messages && Array.isArray(error.messages)) {
      for (const message of error.messages) {
        errors.push({
          field: message.field,
          message: message.message,
        })
      }
    } else if (error.errors && Array.isArray(error.errors)) {
      // Alternative structure for VineJS errors
      for (const err of error.errors) {
        errors.push({
          field: err.field,
          message: err.message,
        })
      }
    } else if (error.message && typeof error.message === 'object') {
      // Sometimes the message itself contains the validation errors
      for (const [field, messages] of Object.entries(error.message)) {
        if (Array.isArray(messages)) {
          for (const msg of messages) {
            errors.push({
              field: field,
              message: typeof msg === 'string' ? msg : msg.message,
            })
          }
        }
      }
    }

    return errors
  }

  /**
   * Map validation field names to form input element IDs
   * Handles nested field names and array field names appropriately
   */
  private mapFieldToInputId(fieldName: string): string {
    // Handle nested field names (e.g., "user.email" -> "user-email")
    let inputId = fieldName.replace(/\./g, '-')

    // Handle array field names with bracket notation (e.g., "items[0].name" -> "items-0-name")
    inputId = inputId.replace(/\[(\d+)\]/g, '-$1')

    // Handle array field names with dot notation (e.g., "items.0.name" -> "items-0-name")
    inputId = inputId.replace(/\.(\d+)\./g, '-$1-')
    inputId = inputId.replace(/\.(\d+)$/g, '-$1')

    // Handle complex nested arrays (e.g., "form.fields[0].options[1].value" -> "form-fields-0-options-1-value")
    inputId = inputId.replace(/\[(\w+)\]/g, '-$1')

    // Clean up any double dashes that might have been created
    inputId = inputId.replace(/-+/g, '-')

    // Remove leading/trailing dashes
    inputId = inputId.replace(/^-+|-+$/g, '')

    return inputId
  }
}
