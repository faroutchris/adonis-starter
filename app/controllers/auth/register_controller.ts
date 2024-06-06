import VerifyEmailNotification from '#mails/verify_email_notification'
import User from '#models/user'
import { registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class RegisterController {
  async show({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  async store({ request, response, auth }: HttpContext) {
    const form = await request.validateUsing(registerValidator)
    const user = await User.create(form)
    await auth.use('web').login(user)
    await mail.send(new VerifyEmailNotification(user))
    return response.redirect().toRoute('home')
  }
}
