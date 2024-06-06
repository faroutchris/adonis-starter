import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Token extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare hash: string

  @column()
  declare type: string

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  static async generatePasswordReset(user: User | null) {
    if (!user) return null

    const hash = randomUUID()
    await Token.expirePasswordResets(user)
    const record = await user.related('tokens').create({
      expiresAt: DateTime.now().plus({ hours: 1 }),
      hash: hash,
      type: 'PASSWORD_RESET',
    })

    return record.hash
  }

  static async expirePasswordResets(user: User) {
    await user.related('tokens').query().update({
      expiresAt: DateTime.now(),
    })
  }

  static async getPasswordResetUser(hash: string) {
    const record = await Token.query()
      .preload('user')
      .where('hash', hash)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .orderBy('createdAt', 'desc')
      .first()

    return record?.user
  }

  static async verify(hash: string) {
    const record = await Token.query()
      .where('expiresAt', '>', DateTime.now().toSQL())
      .where('hash', hash)
      .first()

    return !!record
  }
}
