import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

/**
 * Tasks:
 * [] Create a TurboStreamMiddleware
 *    [] Detects a turbo request and upgrades the response (adds mime-type)
 *    [] Provides TurboStream with ctx, remove inject() both in class and at controller level
 *    [] Provide ctx with an instance of TurboStream
 * [] Figure out how to get rid of <turbo-stream> tags in the partials
 *    Docs: "The key to Turbo Streams is the ability to reuse your existing server-side templates to perform live, partial page changes.
 *          The HTML template used to render each message in a list of such on the first page load is the same template that’ll be used
 *          to add one new message to the list dynamically later. This is at the essence of the HTML-over-the-wire approach"
 *    This means that the partials should not have any directives. We add them when we respond with a turbostream template
 * [] Add a provider for TurboStream if we need config
 * [] Add a pattern matching function of some type to ctx: switch (request.format) case html -> .. case turbo ->
 * [] Populate turbo data/state with flashMessages
 * [] Figure out a better way to render multiple templates
 * [] Align with rails api =>
 *    Ruby: render turbo_stream: turbo_stream.append(:dom_id, partial: "some/template", locals: { message: message })
 *    JS: turboStream.append("selector", "some/template", { state })
 */

type TurboDirectives = {
  target?: string
  action?: string
}

class TurboTemplate {
  directives?: TurboDirectives
  path?: string
  state?: Record<string, any>

  constructor(path: string, state: Record<string, any>, directives: TurboDirectives) {
    this.path = path
    this.state = state
    this.directives = directives
  }
}

@inject()
export default class TurboStream {
  constructor(protected ctx: HttpContext) {}

  private static MIME_TYPE = 'text/vnd.turbo-stream.html'

  private setHeader() {
    this.ctx.response.safeHeader('Content-Type', TurboStream.MIME_TYPE)
  }

  isTurboStream() {
    return this.ctx.request.header('Accept')?.includes(TurboStream.MIME_TYPE)
  }

  from(path: string, state: Record<string, any>, directives: TurboDirectives) {
    return new TurboTemplate(path, state, directives)
  }

  async render(template: TurboTemplate) {
    this.setHeader()

    const { directives, path, state } = template

    if (!path) throw new Exception('No template found')

    return this.ctx.view.render(path, { ...state, directives })
  }

  async renderAll(templates: TurboTemplate[]) {
    const renderedStreams = await Promise.all(
      templates.map(async (template) => await this.render(template))
    )

    return this.ctx.view.renderRaw(renderedStreams.join(''))
  }
}
