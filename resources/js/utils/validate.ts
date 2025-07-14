import Regex from './regex.js'

enum ValidationErrorType {
  TooShort = 'too-short',
  TooLong = 'too-long',
  NotNumber = 'not-number',
  IsNotInteger = 'not-integer',
  Empty = 'empty',
  InvalidEmail = 'invalid-email',
  WeakPassword = 'weak-password',
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export default class Validate {
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError
  }

  static length(input: string, min: number, max: number) {
    if (input.length < min) {
      throw new ValidationError(ValidationErrorType.TooShort)
    }
    if (input.length > max) {
      throw new ValidationError(ValidationErrorType.TooLong)
    }
  }

  static isNumber(input: string) {
    const num = Number(input)
    if (!input || Number.isNaN(num)) {
      throw new ValidationError(ValidationErrorType.NotNumber)
    }
  }

  static isInteger(input: string) {
    const num = Number(input)
    if (!input || Number.isNaN(num) || !Number.isInteger(num)) {
      throw new ValidationError(ValidationErrorType.IsNotInteger)
    }
  }

  static isNotEmpty(input: string) {
    if (input.trim() === '') {
      throw new ValidationError(ValidationErrorType.Empty)
    }
  }

  static isEmail(input: string) {
    if (!Regex.email.test(input.trim())) {
      throw new ValidationError(ValidationErrorType.InvalidEmail)
    }
  }

  static isStrongPassword(input: string) {
    if (!Regex.password.test(input)) {
      throw new ValidationError(ValidationErrorType.WeakPassword)
    }
  }
}
