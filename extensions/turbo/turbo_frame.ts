import { HttpContext } from '@adonisjs/core/http'
import * as HTMLParser from 'node-html-parser'

export default class TurboFrame {
  constructor(
    protected ctx: HttpContext,
    protected parse: typeof HTMLParser.parse
  ) {}

  private setEtagHeader(response: string) {
    const byteLength = Buffer.from(response.toString()).byteLength
    const timestamp = new Date(Date.now() / 1000).valueOf() // always busting cache
    const etag = `"${timestamp}-${byteLength}"`
    this.ctx.response.safeHeader('ETag', etag)
  }

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

      const frame = templateDOM.getElementById(frameId)
      const head = templateDOM.getElementsByTagName('head') // Does this actually work or do anything
      const response = head.toString() + frame?.toString()

      if (frame) {
        // set etag header so that the cache for this frame isn't served in a regular request
        this.setEtagHeader(response)
        return response
      }
    }

    return this.ctx.view.render(templatePath, state)
  }
}
