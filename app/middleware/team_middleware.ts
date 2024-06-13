import Team from '#models/team'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class TeamMiddleware {
  redirectTo = '/auth/login'

  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */

    const user = ctx.auth.user

    // if (!user) {
    //   return ctx.response.redirect('/')
    // }

    // const teams = await user.related('teams').query()
    if (user) {
      return ctx.response.redirect(this.redirectTo)
    }

    /**
     * Call next method in the pipeline and return its output
     */
    return next()
  }
}
