import PasswordResetCookie from '#helpers/cookies/password_reset_cookie'
import PasswordResetNotification from '#mails/password_reset_notification'
import User from '#models/user'
import PasswordResetService from '#services/password_reset_service'
import { passwordResetValidator, passwordResetVerifyValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

/**
 * Password reset controller
 */
@inject()
export default class PasswordResetController {
  constructor(protected resetCookie: PasswordResetCookie) {}

  async show({ view }: HttpContext) {
    return view.render('pages/auth/reset')
  }

  /**
   * Send a password reset email to the user if they exist in our records.
   */
  async send({ request, response, session }: HttpContext) {
    const { email } = await request.validateUsing(passwordResetValidator)

    session.flash(
      'success',
      `A password reset email has been sent to ${email} if it exists in our records`
    )

    const user = await User.findBy('email', email)

    if (user) {
      const hash = await PasswordResetService.generate(user)

      await mail.send(
        new PasswordResetNotification({ user, link: PasswordResetService.generateLink(hash) })
      )
    }

    return response.redirect().toRoute('auth.login.show')
  }

  /**
   * Verify a password reset token.
   * If the token is valid, set it in a cookie for later use.
   */
  @inject()
  async verify({ view, params }: HttpContext) {
    const token: string = params.token

    const isValid = await PasswordResetService.verify(token)

    if (isValid) {
      this.resetCookie.set(token)
    }

    return view.render('pages/auth/verify_reset', { isValid })
  }

  /**
   * Updates the user's password after a successful password reset.
   */
  @inject()
  async update({ request, response, session, auth }: HttpContext) {
    const { password } = await request.validateUsing(passwordResetVerifyValidator)

    const user = await PasswordResetService.getUser(this.resetCookie.read())

    this.resetCookie.clear()

    if (!user) {
      session.flash('error', 'Token has expired or the associated user could not be found')
      return response.redirect().back()
    }

    await user.merge({ password }).save()

    await auth.use('web').login(user)

    return response.redirect().toRoute('home')
  }
}
