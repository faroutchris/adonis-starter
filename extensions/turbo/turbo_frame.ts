import { HttpContext } from '@adonisjs/core/http'
import * as HTMLParser from 'node-html-parser'

export default class TurboFrame {
  constructor(
    protected ctx: HttpContext,
    protected parse: typeof HTMLParser.parse
  ) {}

  isTurboFrame() {
    return !!this.ctx.request.header('Turbo-Frame')
  }

  getTurboFrame() {
    return this.ctx.request.header('Turbo-Frame')
  }

  async render(templatePath: string, state?: Record<string, any>): Promise<string> {
    const frameId = this.getTurboFrame()
    if (frameId) {
      const template = await this.ctx.view.render(templatePath, state)

      const frame = this.parse(template).getElementById(frameId)

      if (frame) {
        return this.ctx.view.renderRaw(frame?.toString())
      }
    }

    return this.ctx.view.render(templatePath, state)
  }
}
