import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SilentAuthMiddleware {
  async handle({ auth }: HttpContext, next: NextFn) {
    /**
     * Resolves auth.user for all routes
     */
    await auth.check()

    /**
     * Call next method in the pipeline and return its output
     */
    return next()
  }
}
