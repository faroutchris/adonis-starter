import vine from '@vinejs/vine'

export const saveTaskValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(2).maxLength(250).trim(),
  })
)

export const updateTaskValidator = vine.compile(
  vine.object({
    done: vine.boolean().optional(),
  })
)
