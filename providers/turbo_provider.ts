import TurboStream from '#extensions/turbo/turbo_stream'
import { HttpContext } from '@adonisjs/core/http'
import type { ApplicationService } from '@adonisjs/core/types'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    turboStream: () => TurboStream
  }
}

export default class TurboProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {
    HttpContext.macro('turboStream', function () {
      // @ts-ignore
      const self = this as HttpContext // <-- this will refer to ctx
      console.log('INSTANCE OF HttpContext', self)
      return new TurboStream(self)
    })
  }

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
