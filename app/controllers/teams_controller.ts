import Team from '#models/team'
import type { HttpContext } from '@adonisjs/core/http'

export default class TeamsController {
  async index({ view }: HttpContext) {
    const team = await Team.query().preload('users').where('id', 1).firstOrFail()

    console.log(team.users)

    return view.renderRaw('Hello world')
  }

  async show({ view, params }: HttpContext) {
    const team = await Team.query().preload('users').where('slug', params.slug).firstOrFail()

    return view.render('pages/teams/show', { team })
  }
}
