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
      const templateDOM = this.parse(template)
      const frame = templateDOM.getElementById(frameId)?.toString() || ''

      if (frame.length) {
        // set etag header so that the cache for this frame isn't served in a regular request
        this.ctx.response.setEtag(frame)
        return frame
      }
    }

    return this.ctx.view.render(templatePath, state)
  }
}
