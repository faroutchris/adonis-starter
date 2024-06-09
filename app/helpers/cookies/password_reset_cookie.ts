import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { CookieOptions } from '@adonisjs/core/types/http'

@inject()
export default class PasswordResetCookie {
  name: string = 'password_reset_token'
  options: Partial<CookieOptions> = {
    domain: '',
    path: '/',
    // We expire the tokens in our db
    maxAge: '2h',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  }
  request: HttpContext['request']
  response: HttpContext['response']

  constructor(protected ctx: HttpContext) {
    this.request = ctx.request
    this.response = ctx.response
  }

  set(hash: string) {
    this.response.cookie(this.name, hash, this.options)
  }

  read() {
    return this.request.cookie(this.name, '')
  }

  clear() {
    this.response.clearCookie(this.name)
  }
}
