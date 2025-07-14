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
  declare private errors: ErrorEntry[]
  declare readonly hasInputTarget: boolean
  declare readonly inputTarget: HTMLInputElement
  declare readonly inputTargets: HTMLInputElement[]

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
    console.log(this.errors)

    this.inputTargets.forEach((input) => {
      input.dataset.dirty = 'true'
      this.validateInput(input)
      const invalidClass = input.getAttribute('data-invalid-class')
      if (invalidClass && input.classList.contains(invalidClass)) {
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
    const invalidClass = input.getAttribute('data-invalid-class')
    const validClass = input.getAttribute('data-valid-class')
    const invalidFeedbackElementRef = input.getAttribute('data-invalid-element')
    const invalidElement = invalidFeedbackElementRef
      ? this.element.querySelector(invalidFeedbackElementRef)
      : null

    this.processValidationRules(value, validatesAttribute)

    // reset
    if (invalidClass) input.classList.remove(invalidClass)
    if (validClass) input.classList.remove(validClass)
    if (invalidElement) {
      invalidElement.classList.remove(invalidClass ?? '')
      invalidElement.textContent = ''
    }

    // update
    if (this.errors.length > 0) {
      if (invalidClass) input.classList.add(invalidClass)
      if (invalidElement) {
        const firstError = this.errors[0]
        invalidElement.classList.add(invalidClass ?? '')
        invalidElement.textContent = firstError.message || ''
      }
    } else {
      if (validClass) input.classList.add(validClass)
    }
  }

  processValidationRules(value: string, validatesAttribute: string | null) {
    this.errors = []
    if (!validatesAttribute) return []
    let rules: ValidationRule[] = []

    try {
      rules = JSON.parse(validatesAttribute)
    } catch (e) {
      console.error('Invalid JSON in data-validates attribute:', validatesAttribute)
      return []
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
                this.errors.push({
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
              this.errors.push({
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
              this.errors.push({
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
              this.errors.push({
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
              this.errors.push({
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
              this.errors.push({
                type: e.message,
                message: rule.message,
              })
            }
          }
          break
      }
    }
  }
}
