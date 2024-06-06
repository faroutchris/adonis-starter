import User from '#models/user'
import { BaseMail } from '@adonisjs/mail'

export default class PasswordResetNotification extends BaseMail {
  from = 'noreply@reddigital.com'
  subject = 'Password reset'
  data: { user: User; link: string }

  constructor(data: { user: User; link: string }) {
    super()
    this.data = data
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.data.user.email).htmlView('emails/reset_password', this.data)
  }
}
