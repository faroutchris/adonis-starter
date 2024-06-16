import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import ProfileService from './profile_service.js'
import { inject } from '@adonisjs/core'
import VerifyEmailNotification from '#mails/verify_email_notification'
import mail from '@adonisjs/mail/services/main'

@inject()
export default class AuthService {
  constructor(
    protected ctx: HttpContext,
    protected profileService: ProfileService
  ) {}

  async login(form: { email: string; password: string; rememberMe?: boolean }) {
    const { auth } = this.ctx
    const user = await User.verifyCredentials(form.email, form.password)
    await auth.use('web').login(user, !!form.rememberMe)
  }

  async logout() {
    const { auth } = this.ctx
    await auth.use('web').logout()
  }

  async register(form: { name: string; email: string; password: string }) {
    const { auth } = this.ctx
    // Create user
    const user = await User.create(form)
    // Create profile
    await this.profileService.create(user)
    // Login
    await auth.use('web').login(user)
    // Send out notification to the user
    await mail.send(new VerifyEmailNotification(user))
  }
}
