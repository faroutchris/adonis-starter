import { HttpContext } from '@adonisjs/core/http'

export default class TurboFrame {
  constructor(protected ctx: HttpContext) {}

  isTurboFrame() {
    return !!this.ctx.request.header('Turbo-Frame')
  }

  getTurboFrame() {
    return this.ctx.request.header('Turbo-Frame')
  }

  render(templatePath: string, state?: Record<string, any>): Promise<string> {
    if (this.isTurboFrame()) {
      const frame = this.getTurboFrame()
      console.log('frame', frame)
      // Do something here to parse out only the matching <turbo-frame>
    }

    return this.ctx.view.render(templatePath, state)
  }
}
