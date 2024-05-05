import type { HttpContext } from '@adonisjs/core/http'

export default class LogoutController {
  async handle({ response, auth }: HttpContext) {
    auth.use('web').logout()
    response.redirect().toRoute('home')
  }
}
