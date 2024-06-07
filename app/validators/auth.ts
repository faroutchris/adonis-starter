import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    name: vine.string(),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value, _field) => {
        const result = await db.from('users').select('id').where('email', value)
        return result.length ? false : true
      }),
    password: vine.string().minLength(8),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string(),
    rememberMe: vine.boolean().optional(),
  })
)

export const passwordResetValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)

export const passwordResetVerifyValidator = vine.compile(
  vine.object({
    token: vine.string(),
    password: vine.string().minLength(8),
  })
)
