import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

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

export default class TurboStream {
  constructor(protected ctx: HttpContext) {
    console.log('constructor --->', ctx)
  }

  templates: TurboTemplate[] = []

  private partial = `<turbo-stream action="{{directives.action}}" target="{{directives.target}}"><template>{{{ body }}}</template></turbo-stream>`

  private static MIME_TYPE = 'text/vnd.turbo-stream.html'

  private setHeader() {
    this.ctx.response.safeHeader('Content-Type', TurboStream.MIME_TYPE)
  }

  isTurboStream() {
    console.log(this)
    return this.ctx.request.header('Accept')?.includes(TurboStream.MIME_TYPE)
  }

  from(path: string, state: Record<string, any>, directives: TurboDirectives) {
    return new TurboTemplate(path, state, directives)
  }

  // methods
  prepend(path: string, state: Record<string, any>, target: string) {
    const template = this.from(path, state, { action: 'prepend', target })
    this.templates.push(template)
    return this
  }

  append(path: string, state: Record<string, any>, target: string) {
    const template = this.from(path, state, { action: 'append', target })
    this.templates.push(template)
    return this
  }

  replace(path: string, state: Record<string, any>, target: string) {
    const template = this.from(path, state, { action: 'replace', target })
    this.templates.push(template)
    return this
  }

  update(path: string, state: Record<string, any>, target: string) {
    const template = this.from(path, state, { action: 'update', target })
    this.templates.push(template)
    return this
  }

  remove(target: string) {
    const template = new TurboTemplate('', {}, { action: 'remove', target })
    this.templates.push(template)
    return this
  }

  before(path: string, state: Record<string, any>, target: string) {
    const template = this.from(path, state, { action: 'before', target })
    this.templates.push(template)
    return this
  }

  after(path: string, state: Record<string, any>, target: string) {
    const template = this.from(path, state, { action: 'after', target })
    this.templates.push(template)
    return this
  }

  morph(path: string, state: Record<string, any>, target: string, childrenOnly: boolean) {
    const template = this.from(path, state, {
      action: 'morph',
      target,
      childrenOnly,
    })
    this.templates.push(template)
    return this
  }

  refresh(path: string, state: Record<string, any>, requestId: string) {
    const template = this.from(path, state, { action: 'morph', requestId })
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
      return this.ctx.view.renderRaw(this.partial, { body: '', directives })

    if (!path) throw new Exception('No template found')

    /* Render the partial */
    const body = await this.ctx.view.render(path, state)

    /* Inject partial and directives into the turbo stream component */
    return this.ctx.view.renderRaw(this.partial, { body, directives })
  }

  async renderAll(templates: TurboTemplate[]) {
    const renderedStreams = await Promise.all(
      templates.map(async (template) => await this.renderOne(template))
    )

    return this.ctx.view.renderRaw(renderedStreams.join(''))
  }
}
