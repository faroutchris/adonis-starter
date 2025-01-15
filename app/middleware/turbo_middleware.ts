import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class TurboMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    // console.log('flash: ', ctx.session.flashMessages)
    ctx.view.share({ isTurboFrameRequest: !!ctx.request.headers()['x-turbo-request-id'] })

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
