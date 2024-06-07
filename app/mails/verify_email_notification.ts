import User from '#models/user'
import { BaseMail } from '@adonisjs/mail'

export default class VerifyEmailNotification extends BaseMail {
  user: User
  from = 'noreply@reddigital.com'
  subject = 'Verify your email'

  constructor(user: User) {
    super()
    this.user = user
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.user.email).htmlView('emails/verify_email', { user: this.user })
  }
}
