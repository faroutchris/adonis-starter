import TurboFrame from '#extensions/turbo/turbo_frame'
import TurboStream from '#extensions/turbo/turbo_stream'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { parse } from 'node-html-parser'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    turboStream: TurboStream
    turboFrame: TurboFrame
  }
}

export default class TurboMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Attach turboStream class
     */
    ctx.turboStream = new TurboStream(ctx)
    ctx.turboFrame = new TurboFrame(ctx, parse)

    // Todo Add turbo view helpers here:
    ctx.view.share({ isTurboFrame: ctx.turboFrame.isTurboFrame() })

    /**
     * Call next method in the pipeline and return its output
     */
    await next()
  }
}
