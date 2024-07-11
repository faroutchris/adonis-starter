import TurboFrame from '#providers/turbo/turbo_frame'
import TurboStream from '#providers/turbo/turbo_stream'
import { HttpContext } from '@adonisjs/core/http'
import type { ApplicationService } from '@adonisjs/core/types'
import { parse } from 'node-html-parser'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    turboStream: TurboStream
    turboFrame: TurboFrame
  }
}

export default class TurboProvider {
  constructor(protected app: ApplicationService) {}
  /**
   * The container bindings have booted
   */
  async boot() {
    HttpContext.getter('turboStream', function () {
      // @ts-ignore
      const self = this as HttpContext
      return new TurboStream(self)
    })

    HttpContext.getter('turboFrame', function () {
      // @ts-ignore
      const self = this as HttpContext
      return new TurboFrame(self, parse)
    })

    // Todo Add turbo view helpers here:
    // ctx.view.share({ isTurboFrame: ctx.turboFrame.isTurboFrame() })
  }
}
