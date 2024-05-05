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
