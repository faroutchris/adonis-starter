import vine from '@vinejs/vine'

export const profileUpdateValidator = vine.compile(
  vine.object({
    bio: vine.string().trim().maxLength(240).nullable(),
  })
)
