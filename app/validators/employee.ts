import vine from '@vinejs/vine'

export const employeeUpdateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(256),
    city: vine.string().trim().minLength(1).maxLength(256),
    position: vine.string().trim().minLength(1).maxLength(256),
    salary: vine.number().withoutDecimals().min(1),
  })
)
