import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

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
 * [] Add a provider for TurboStream if we need config - for example asset versioning, paths to layouts
 * [x] Add a pattern matching functionality of some type to ctx: switch (request.format) case html -> .. case turbo ->
 *    - Solved with class based approach ( new Renderer extends BaseTurboStreamRenderer {} )
 * [] Populate turbo data/state with flashMessages
 * [x] Figure out a better way to render multiple templates for streams (turbo drive should only render one template btw)
 * [] Add support for all directives on TurboStream and TurboDrive
 * [] Align with rails api =>
 *    Ruby: render turbo_stream: turbo_stream.append(:dom_id, partial: "some/template", locals: { message: message })
 *    JS: turboStream.append("selector", "some/template", { state })
 *    https://github.com/hotwired/turbo-rails/blob/main/app/models/turbo/streams/tag_builder.rb
 * [] Enable x-csrf-token (adonis docs)
 *    Docs: "Turbo provides CSRF protection by checking the DOM for the existence of a <meta> tag with a name value of either
 *          csrf-param or csrf-token. For example:
 *          <meta name="csrf-token" content="[your-token]">
 * [] Turbo Frames
 *    [] Render a minimal layout (<head /> + <turbo /> tags) when a turbo frame request is detected (request.headers["Turbo-Frame"])
 *       https://github.com/hotwired/turbo-rails/blob/main/app/controllers/turbo/frames/frame_request.rb
 * [] Expose TurboFrame & TurboStream classes to DI system (ie construct in provider)
 */

// API?
// return turbo.stream.append()
// return turbo.render()

type TurboDirectives = {
  target?: string
  action?: string
  childrenOnly?: boolean // morph
  requestId?: string // refresh
}

export class TurboTemplate {
  directives?: TurboDirectives
  path?: string
  state?: Record<string, any>

  constructor(path: string, state: Record<string, any>, directives: TurboDirectives) {
    this.path = path
    this.state = state
    this.directives = directives
  }
}

export abstract class BaseTurboStreamRenderer {
  constructor(protected ctx: HttpContext) {}

  stream(): TurboTemplate | TurboTemplate[] | void {}

  html(): Promise<string> | void {}
}

export default class TurboStream {
  constructor(protected ctx: HttpContext) {}

  templates: TurboTemplate[] = []

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

  // methods
  prepend(path: string, state: Record<string, any>, target: string) {
    const template = this.ctx.turboStream.from(path, state, { action: 'prepend', target })
    this.templates.push(template)
    return this
  }

  append(path: string, state: Record<string, any>, target: string) {
    const template = this.ctx.turboStream.from(path, state, { action: 'append', target })
    this.templates.push(template)
    return this
  }

  replace(path: string, state: Record<string, any>, target: string) {
    const template = this.ctx.turboStream.from(path, state, { action: 'replace', target })
    this.templates.push(template)
    return this
  }

  update(path: string, state: Record<string, any>, target: string) {
    const template = this.ctx.turboStream.from(path, state, { action: 'update', target })
    this.templates.push(template)
    return this
  }

  remove(target: string) {
    const template = new TurboTemplate('', {}, { action: 'remove', target })
    this.templates.push(template)
    return this
  }

  before(path: string, state: Record<string, any>, target: string) {
    const template = this.ctx.turboStream.from(path, state, { action: 'before', target })
    this.templates.push(template)
    return this
  }

  after(path: string, state: Record<string, any>, target: string) {
    const template = this.ctx.turboStream.from(path, state, { action: 'after', target })
    this.templates.push(template)
    return this
  }

  morph(path: string, state: Record<string, any>, target: string, childrenOnly: boolean) {
    const template = this.ctx.turboStream.from(path, state, {
      action: 'morph',
      target,
      childrenOnly,
    })
    this.templates.push(template)
    return this
  }

  refresh(path: string, state: Record<string, any>, requestId: string) {
    const template = this.ctx.turboStream.from(path, state, { action: 'morph', requestId })
    this.templates.push(template)
    return this
  }

  async render() {
    /* Upgrade response */
    this.setHeader()

    if (this.templates.length === 0)
      throw new Exception('No templates have been added for rendering')

    if (this.templates.length > 1) return this.renderAll(this.templates)

    return this.renderOne(this.templates[0])
  }

  async renderOne(template: TurboTemplate) {
    const { directives, path, state } = template

    if (directives?.action === 'remove')
      return this.ctx.view.render('turbo_stream', { body: '', directives })

    if (!path) throw new Exception('No template found')

    /* Render the partial */
    const body = await this.ctx.view.render(path, state)

    /* Inject partial and directives into the turbo stream component */
    return this.ctx.view.render('turbo_stream', { body, directives })
  }

  async renderAll(templates: TurboTemplate[]) {
    const renderedStreams = await Promise.all(
      templates.map(async (template) => await this.renderOne(template))
    )

    return this.ctx.view.renderRaw(renderedStreams.join(''))
  }
}
