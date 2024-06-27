import TurboStream from '#extensions/turbo/turbo_stream'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    turboStream: TurboStream
  }
}

export default class TurboMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    ctx.turboStream = new TurboStream(ctx)

    /**
     * Call next method in the pipeline and return its output
     */
    await next()
  }
}
