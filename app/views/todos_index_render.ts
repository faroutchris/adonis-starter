import { BaseTurboStreamRenderer } from '#extensions/turbo/turbo_stream'
import Todo from '#models/todo'
import { HttpContext } from '@adonisjs/core/http'

export class TodoIndexRender extends BaseTurboStreamRenderer {
  state: { todo: Todo; notification: string }

  constructor(
    protected ctx: HttpContext,
    state: { todo: Todo; notification: string }
  ) {
    super(ctx)
    this.state = state
  }

  stream() {
    const { todo, notification } = this.state

    const taskTemplate = this.ctx.turboStream.from(
      'pages/todos/task',
      { todo },
      { action: 'prepend', target: 'task-list' }
    )

    const messageTemplate = this.ctx.turboStream.from(
      'pages/todos/success_notification',
      { notification },
      { action: 'update', target: 'toast-notification' }
    )

    return [taskTemplate, messageTemplate]
  }

  html() {
    this.ctx.session.flash('success', this.state.notification)

    return this.ctx.response.redirect().back()
  }
}
