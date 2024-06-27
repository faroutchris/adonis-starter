import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'
import edge from 'edge.js'

/**
 * Tasks:
 * [x] Create a TurboStreamMiddleware
 *    [-] Detects a turbo request and upgrades the response (adds mime-type)--
 *       Upgrading all responses with accept header makes all requests turbo streams - only upgrade before sending
 *    [x] Provides TurboStream with ctx, remove inject() both in class and at controller level
 *    [x] Provide ctx with an instance of TurboStream
 * [x] Figure out how to get rid of <turbo-stream> tags in the partials
 *    Docs: "The key to Turbo Streams is the ability to reuse your existing server-side templates to perform live, partial page changes.
 *          The HTML template used to render each message in a list of such on the first page load is the same template that’ll be used
 *          to add one new message to the list dynamically later. This is at the essence of the HTML-over-the-wire approach"
 *    This means that the partials should not have any directives. We add them when we respond with a turbostream template
 * [] Add a provider for TurboStream if we need config - for example asset versioning
 * [] Add a pattern matching functionality of some type to ctx: switch (request.format) case html -> .. case turbo ->
 * [] Populate turbo data/state with flashMessages
 * [] Figure out a better way to render multiple templates for streams (turbo drive should only render one template btw)
 * [] Add support for all directives on TurboStream and TurboDrive
 * [] Align with rails api =>
 *    Ruby: render turbo_stream: turbo_stream.append(:dom_id, partial: "some/template", locals: { message: message })
 *    JS: turboStream.append("selector", "some/template", { state })
 * [] Enable x-csrf-token (adonis docs)
 *    Docs: "Turbo provides CSRF protection by checking the DOM for the existence of a <meta> tag with a name value of either
 *          csrf-param or csrf-token. For example:
 *          <meta name="csrf-token" content="[your-token]">
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
    const { directives, path, state } = template

    if (!path) throw new Exception('No template found')

    /* Upgrade response */
    this.setHeader()

    const body = await this.ctx.view.render(path, state)

    return this.ctx.view.render('turbo_stream', { body, directives })
  }

  async renderAll(templates: TurboTemplate[]) {
    const renderedStreams = await Promise.all(
      templates.map(async (template) => await this.render(template))
    )

    return this.ctx.view.renderRaw(renderedStreams.join(''))
  }
}
