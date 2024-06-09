import AuthService from '#services/auth_service'
import { registerValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RegisterController {
  constructor(protected authService: AuthService) {}

  async show({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  async store({ request, response }: HttpContext) {
    const form = await request.validateUsing(registerValidator)

    this.authService.register(form)

    return response.redirect().toRoute('home')
  }
}
