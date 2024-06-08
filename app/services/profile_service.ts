import Profile from '#models/profile'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ProfileService {
  constructor(protected ctx: HttpContext) {}

  async find() {
    const { auth } = this.ctx

    const user = auth.use('web').getUserOrFail()

    const {
      name,
      email,
      profile: { bio },
    } = await User.query().preload('profile').where('id', user.id).firstOrFail()

    return { name, email, bio }
  }

  async create(user: User) {
    return user.related('profile').create({})
  }

  async update(data: Partial<Profile>) {
    const { auth } = this.ctx

    const user = auth.use('web').getUserOrFail()

    const profile = await Profile.query().where('userId', user.id).firstOrFail()

    await profile.merge(data).save()
  }
}
