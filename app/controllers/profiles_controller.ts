import ProfileService from '#services/profile_service'
import { profileUpdateValidator } from '#validators/profile'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ProfilesController {
  constructor(protected profileService: ProfileService) {}

  async index({ view }: HttpContext) {
    return view.render('pages/profile/index')
  }

  async show({ view }: HttpContext) {
    const { name, email, bio } = await this.profileService.find()

    return view.render('pages/profile/edit', { name, email, bio })
  }

  async update({ response, request, session }: HttpContext) {
    const formData = await request.validateUsing(profileUpdateValidator)

    await this.profileService.update(formData)

    session.flash('success', 'Successfully updated your profile')

    return response.redirect().toRoute('profiles.edit')
  }
}
