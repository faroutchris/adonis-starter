import vine from '@vinejs/vine'

export const employeeValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(256),
    city: vine.string().trim().minLength(1).maxLength(256),
    position: vine.string().trim().minLength(1).maxLength(256),
    salary: vine.number().withoutDecimals().min(100),
  })
)

// Test validator that will always fail for testing fallback handling
export const testEmployeeValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(256)
      .regex(/^INVALID$/), // This will always fail unless name is exactly "INVALID"
    city: vine.string().trim().minLength(1).maxLength(256),
    position: vine.string().trim().minLength(1).maxLength(256),
    salary: vine.number().withoutDecimals().min(100),
  })
)
