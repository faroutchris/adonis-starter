import PasswordResetNotification from '#mails/password_reset_notification'
import User from '#models/user'
import PasswordResetService from '#services/password_reset_service'
import env from '#start/env'
import { passwordResetValidator, passwordResetVerifyValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import PasswordResetTokenCookie from '../../cookies/password_reset_token.js'
import { inject } from '@adonisjs/core'

export default class PasswordResetController {
  async show({ view }: HttpContext) {
    return view.render('pages/auth/reset')
  }

  async send({ request, response, session }: HttpContext) {
    const { email } = await request.validateUsing(passwordResetValidator)

    session.flash(
      'success',
      `A password reset email has been sent to ${email} if it exists in our records`
    )

    const user = await User.findBy('email', email)

    if (user) {
      const hash = await PasswordResetService.generate(user)

      const link = `http://${env.get('HOST')}:${env.get('PORT')}/password/reset/${hash || ''}` // TODO fix

      await mail.send(new PasswordResetNotification({ user, link }))
    }

    return response.redirect().toRoute('auth.login.show')
  }

  @inject()
  async verify({ view, params }: HttpContext, cookie: PasswordResetTokenCookie) {
    const token: string = params.token

    const isValid = await PasswordResetService.verify(token)

    if (isValid) {
      cookie.set(token)
    }

    return view.render('pages/auth/verify_reset', { isValid })
  }

  @inject()
  async update(
    { request, response, session, auth }: HttpContext,
    cookie: PasswordResetTokenCookie
  ) {
    const { password } = await request.validateUsing(passwordResetVerifyValidator)

    const user = await PasswordResetService.getUser(cookie.read())

    cookie.clear()

    if (!user) {
      session.flash('error', 'Token has expired or the associated user could not be found')
      return response.redirect().back()
    }

    await user.merge({ password }).save()

    await auth.use('web').login(user)

    return response.redirect().toRoute('home')
  }
}
