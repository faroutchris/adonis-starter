import Token from '#models/token'
import User from '#models/user'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import env from '#start/env'
import router from '@adonisjs/core/services/router'

export default class PasswordResetService {
  static async generate(user: User | null) {
    if (!user) return null

    const hash = randomUUID()
    await this.expire(user)
    const record = await user.related('tokens').create({
      expiresAt: DateTime.now().plus({ minutes: 1 }),
      hash: hash,
      type: 'PASSWORD_RESET',
    })

    return record.hash
  }

  static generateLink(hash: string | null) {
    const baseUrl = [
      env.get('NODE_ENV') === 'production' ? 'https://' : 'http://',
      env.get('HOST'),
      env.get('NODE_ENV') === 'production' ? '' : `:${env.get('PORT')}`,
    ].join('')

    return router.builder().prefixUrl(baseUrl).params({ token: hash }).make('reset.verify')
  }

  static async expire(user: User) {
    await user.related('tokens').query().update({
      expiresAt: DateTime.now(),
    })
  }

  static async getUser(hash: string) {
    const record = await Token.query()
      .preload('user')
      .where('hash', hash)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .orderBy('createdAt', 'desc')
      .first()

    if (record?.user) {
      await this.expire(record?.user)
    }

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
