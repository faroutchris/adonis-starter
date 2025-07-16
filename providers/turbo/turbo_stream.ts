import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

type TurboDirectives = {
  target?: string
  action?: string
  childrenOnly?: boolean // morph
  requestId?: string // refresh
  method?: string // invoke
  args?: string // invoke - JSON stringified arguments
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
  constructor(protected ctx: HttpContext) {}

  templates: TurboTemplate[] = []

  private partial = `<turbo-stream action="{{directives.action}}" target="{{directives.target}}"
    @if(directives.method)
      method="{{directives.method}}"
    @endif
    @if(directives.args)
      args="{{directives.args}}"
    @endif
    <template>{{{ body }}}</template></turbo-stream>`

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

  invoke(target: string, method: string, args: any[] = []) {
    console.log(`TurboStream.invoke called with target: ${target}, method: ${method}, args:`, args)
    console.log(`Templates before push: ${this.templates.length}`)

    const template = new TurboTemplate(
      '',
      {},
      {
        action: 'invoke',
        target,
        method,
        args: JSON.stringify(args),
      }
    )
    this.templates.push(template)

    console.log(`Templates after push: ${this.templates.length}`)
    console.log(`Template created:`, JSON.stringify(template, null, 2))

    return this
  }

  // Special case, hardcoded to a component and id, don't ship
  flash(type: 'notice' | 'error', message: string, state?: Record<string, any>) {
    this.update('components/flash.edge', { flash: { [type]: message }, ...state }, 'flash')
    return this
  }

  shareFlashMessages() {
    this.ctx.view.share({ flash: this.ctx.session.flashMessages?.all() })
  }

  async render() {
    /* Upgrade response */
    this.setHeader()

    if (this.templates.length === 0)
      throw new Exception('No templates have been added for rendering')

    this.shareFlashMessages()

    if (this.templates.length > 1) return this.renderAll(this.templates)

    return this.renderOne(this.templates[0])
  }

  async renderOne(template: TurboTemplate) {
    const { directives, path, state } = template

    if (directives?.action === 'remove')
      return this.ctx.view.renderRaw(this.partial, { body: '', directives })

    if (directives?.action === 'invoke')
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
