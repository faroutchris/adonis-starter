import { Controller } from '@hotwired/stimulus'
import Validate from '../utils/validate.js'

type ValidationRule = {
  type: string
  params?: string
  message?: string
}

type ErrorEntry = {
  type: string
  message?: string
}

export default class InputValidationController extends Controller<HTMLFormElement> {
  static targets = ['input', 'feedback']
  declare readonly hasInputTarget: boolean
  declare readonly inputTarget: HTMLInputElement
  declare readonly inputTargets: HTMLInputElement[]

  // Track error state per input element
  private inputErrorStates = new WeakMap<HTMLInputElement, ErrorEntry[]>()

  connect() {
    if (this.element instanceof HTMLFormElement) {
      this.element.addEventListener('submit', this.handleSubmit)
    }
  }

  disconnect() {
    if (this.element instanceof HTMLFormElement) {
      this.element.removeEventListener('submit', this.handleSubmit)
    }
  }

  inputTargetConnected(element: HTMLInputElement) {
    if (!(element instanceof HTMLInputElement)) {
      const warning =
        'data-input-validation-target can only be attached to an instance of HTMLInputElement'
      return console.error(warning)
    }
    element.addEventListener('blur', this.handleBlur)
  }

  inputTargetDisconnected(element: HTMLInputElement) {
    element.removeEventListener('blur', this.handleBlur)
    element.removeEventListener('input', this.validateOnBlur)
  }

  handleSubmit = (event: Event) => {
    let valid = true

    this.inputTargets.forEach((input) => {
      input.dataset.dirty = 'true'
      this.validateInput(input)

      // Check if this input has any errors
      const inputErrors = this.inputErrorStates.get(input) || []
      if (inputErrors.length > 0) {
        valid = false
      }
    })

    if (!valid) {
      event.preventDefault()
      event.stopImmediatePropagation() // cancel any other events that listen on the submit button
    }
  }

  handleBlur = (event: Event) => {
    if (event.target instanceof HTMLInputElement) {
      const input = event.target
      // Mark as dirty
      input.dataset.dirty = 'true'
      // Start listening to input events
      this.validateInput(input)
      input.addEventListener('input', this.handleBlur)
    }
  }

  validateOnBlur = (event: Event) => {
    if (event.target instanceof HTMLInputElement) {
      const input = event.target
      if (input.dataset.dirty) this.validateInput(input)
    }
  }

  validateInput(input: HTMLInputElement) {
    const value = input.value
    const validatesAttribute = input.getAttribute('data-validates')

    // Check if there's a server error that should be preserved
    const hasServerError = input.dataset.serverError !== undefined

    // Process client-side validation rules for this input
    const clientErrors = this.processValidationRules(value, validatesAttribute)

    // Get or initialize error state for this input
    let inputErrors: ErrorEntry[] = []

    // If there's a server error and no client-side validation errors, show the server error
    if (hasServerError && clientErrors.length === 0) {
      inputErrors = [
        {
          type: 'server-error',
          message: input.dataset.serverError || '',
        },
      ]
    } else {
      inputErrors = clientErrors
    }

    // Store the error state for this specific input
    this.inputErrorStates.set(input, inputErrors)

    // Apply validation state using the shared logic
    this.applyValidationState(input, inputErrors.length === 0, inputErrors)
  }

  serverError(fieldName: string, message: string) {
    console.log(
      `InputValidationController.serverError called with fieldName: ${fieldName}, message: ${message}`
    )

    // Find input element by field name
    const input = this.findInputByFieldName(fieldName)
    if (!input) {
      console.warn(`Input element not found for field: ${fieldName}`)
      return
    }

    console.log(`Found input element:`, input)

    // Mark input as dirty to enable client-side validation on subsequent changes
    input.dataset.dirty = 'true'

    // Store the server error for this specific input
    input.dataset.serverError = message

    // Set server error in the per-input error state
    const serverErrorEntry: ErrorEntry[] = [
      {
        type: 'server-error',
        message: message,
      },
    ]

    this.inputErrorStates.set(input, serverErrorEntry)
    console.log(`Set error state for input:`, serverErrorEntry)

    // Apply invalid styling and display error message using existing validation UI logic
    this.applyValidationState(input, false, serverErrorEntry)
    console.log(`Applied validation state to input`)

    // Set up listener to clear server error when user starts typing
    const clearServerError = () => {
      delete input.dataset.serverError
      input.removeEventListener('input', clearServerError)
      // Re-validate with client-side rules if input is dirty
      if (input.dataset.dirty) {
        this.validateInput(input)
      }
    }

    // Remove any existing listener to avoid duplicates
    input.removeEventListener('input', clearServerError)
    input.addEventListener('input', clearServerError)
  }

  private findInputByFieldName(fieldName: string): HTMLInputElement | null {
    // Try direct ID match first
    let input = this.element.querySelector(`#${fieldName}`) as HTMLInputElement
    if (input && input instanceof HTMLInputElement) {
      return input
    }

    // Try name attribute match
    input = this.element.querySelector(`[name="${fieldName}"]`) as HTMLInputElement
    if (input && input instanceof HTMLInputElement) {
      return input
    }

    // Handle nested field names (e.g., "user.email" -> "user-email")
    const normalizedFieldName = fieldName.replace(/\./g, '-')
    input = this.element.querySelector(`#${normalizedFieldName}`) as HTMLInputElement
    if (input && input instanceof HTMLInputElement) {
      return input
    }

    // Handle array field names (e.g., "items.0.name" -> "items-0-name")
    const arrayFieldName = fieldName.replace(/\./g, '-')
    input = this.element.querySelector(`#${arrayFieldName}`) as HTMLInputElement
    if (input && input instanceof HTMLInputElement) {
      return input
    }

    return null
  }

  private applyValidationState(
    input: HTMLInputElement,
    isValid: boolean,
    inputErrors: ErrorEntry[] = []
  ) {
    const invalidClass = input.getAttribute('data-invalid-class')
    const validClass = input.getAttribute('data-valid-class')
    const invalidFeedbackElementRef = input.getAttribute('data-invalid-element')
    const invalidElement = invalidFeedbackElementRef
      ? this.element.querySelector(invalidFeedbackElementRef)
      : null

    // Reset classes
    if (invalidClass) input.classList.remove(invalidClass)
    if (validClass) input.classList.remove(validClass)
    if (invalidElement) {
      invalidElement.classList.remove(invalidClass ?? '')
      invalidElement.textContent = ''
    }

    // Apply appropriate state
    if (!isValid && inputErrors.length > 0) {
      if (invalidClass) input.classList.add(invalidClass)
      if (invalidElement) {
        const firstError = inputErrors[0]
        invalidElement.classList.add(invalidClass ?? '')
        invalidElement.textContent = firstError.message || ''
      }
    } else if (isValid) {
      if (validClass) input.classList.add(validClass)
    }
  }

  processValidationRules(value: string, validatesAttribute: string | null): ErrorEntry[] {
    const errors: ErrorEntry[] = []
    if (!validatesAttribute) return errors
    let rules: ValidationRule[] = []

    try {
      rules = JSON.parse(validatesAttribute)
    } catch (e) {
      console.error('Invalid JSON in data-validates attribute:', validatesAttribute)
      return errors
    }

    for (const rule of rules) {
      switch (rule.type) {
        case 'length':
          if (rule.params) {
            try {
              const [min, max] = rule.params.split(',').map(Number)
              Validate.length(value, min, max)
            } catch (e) {
              if (Validate.isValidationError(e)) {
                errors.push({
                  type: e.message,
                  message: rule.message,
                })
              }
            }
          }
          break
        case 'number':
          try {
            Validate.isNumber(value)
          } catch (e) {
            if (Validate.isValidationError(e)) {
              errors.push({
                type: e.message,
                message: rule.message,
              })
            }
          }
          break
        case 'integer':
          try {
            Validate.isInteger(value)
          } catch (e) {
            if (Validate.isValidationError(e)) {
              errors.push({
                type: e.message,
                message: rule.message,
              })
            }
          }
          break
        case 'not-empty':
          try {
            Validate.isNotEmpty(value)
          } catch (e) {
            if (Validate.isValidationError(e)) {
              errors.push({
                type: e.message,
                message: rule.message,
              })
            }
          }
          break
        case 'email':
          try {
            Validate.isEmail(value)
          } catch (e) {
            if (Validate.isValidationError(e)) {
              errors.push({
                type: e.message,
                message: rule.message,
              })
            }
          }
          break
        case 'strong-password':
          try {
            Validate.isStrongPassword(value)
          } catch (e) {
            if (Validate.isValidationError(e)) {
              errors.push({
                type: e.message,
                message: rule.message,
              })
            }
          }
          break
      }
    }

    return errors
  }
}
