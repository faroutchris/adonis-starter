import VerifyEmailNotification from '#mails/verify_email_notification'

import User from '#models/user'
import ProfileService from '#services/profile_service'
import { registerValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

@inject()
export default class RegisterController {
  constructor(protected profileService: ProfileService) {}

  async show({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  async store({ request, response, auth }: HttpContext) {
    const form = await request.validateUsing(registerValidator)
    // Create user and associate them to a profile
    const user = await User.create(form)
    await this.profileService.create(user)

    // Login
    await auth.use('web').login(user)
    // Send out notification to the user
    await mail.send(new VerifyEmailNotification(user))

    return response.redirect().toRoute('home')
  }
}
