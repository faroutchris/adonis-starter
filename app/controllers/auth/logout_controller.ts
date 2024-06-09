import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import AuthService from '#services/auth_service'

@inject()
export default class LogoutController {
  constructor(protected authService: AuthService) {}

  async handle({ response }: HttpContext) {
    this.authService.logout()

    response.redirect().toRoute('home')
  }
}
