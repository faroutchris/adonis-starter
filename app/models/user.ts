import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Token from './token.js'
import Profile from './profile.js'
import Form from './form.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare profileId: number

  @column()
  declare name: string | null

  @column()
  declare email: string

  @column()
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Form)
  declare forms: HasMany<typeof Form>

  @hasMany(() => Token)
  declare tokens: HasMany<typeof Token>

  @hasMany(() => Token, {
    onQuery: (query) => query.where('type', 'PASSWORD_RESET'),
  })
  declare passwordResetTokens: HasMany<typeof Token>

  @hasOne(() => Profile)
  declare profile: HasOne<typeof Profile>

  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)
}
