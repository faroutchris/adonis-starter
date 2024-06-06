import PasswordResetNotification from '#mails/password_reset_notification'
import Token from '#models/token'
import User from '#models/user'
import env from '#start/env'
import { passwordResetValidator } from '#validators/auth'

import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class PasswordResetController {
  async show({ view }: HttpContext) {
    return view.render('pages/auth/reset')
  }

  async send({ request, response, session }: HttpContext) {
    const { email } = await request.validateUsing(passwordResetValidator)

    session.flash(
      'message',
      `A password reset email has been sent to ${email} if it exists in our records`
    )

    const user = await User.findBy('email', email)

    if (user) {
      const hash = await Token.generatePasswordReset(user)
      const link = `http://${env.get('HOST')}:${env.get('PORT')}/password/reset/${hash || ''}` // TODO fix
      await mail.send(new PasswordResetNotification({ user, link }))
    }

    return response.redirect().toRoute('auth.login.show')
  }

  async verify({ view }: HttpContext) {
    return view.render('pages/auth/verify_reset')
  }

  async edit({ view }: HttpContext) {
    // TODO
    return view.renderRaw('Todo')
  }
}
