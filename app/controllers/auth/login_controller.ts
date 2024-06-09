import AuthService from '#services/auth_service'
import { loginValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class LoginController {
  constructor(protected authService: AuthService) {}

  async show({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  async store({ request, response }: HttpContext) {
    const form = await request.validateUsing(loginValidator)

    this.authService.login(form)

    return response.redirect().toRoute('home')
  }
}
