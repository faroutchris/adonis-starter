import Todo from '#models/todo'
import { saveTaskValidator, updateTaskValidator } from '#validators/todo'
import type { HttpContext } from '@adonisjs/core/http'
import TurboStream from '../../extensions/turbo/turbo_stream.js'
import { inject } from '@adonisjs/core'

export default class TodosController {
  async index({ view }: HttpContext) {
    const todos = await Todo.all()

    return view.render('pages/todos/index', { todos })
  }

  @inject()
  async save({ request, response, session }: HttpContext, turboStream: TurboStream) {
    const { title } = await request.validateUsing(saveTaskValidator)

    const todo = await Todo.create({ title })
    const notification = `Added a new todo ${todo.id}`

    if (turboStream.isTurboStream()) {
      const taskTemplate = turboStream.from(
        'pages/todos/create_task',
        { todo },
        { action: 'prepend', target: 'task-list' }
      )
      const messageTemplate = turboStream.from(
        'pages/todos/success_notification',
        { notification },
        { action: 'update', target: 'toast-notification' }
      )

      return turboStream.renderAll([taskTemplate, messageTemplate])
    }

    session.flash('success', notification)

    return response.redirect().back()
  }

  async update({ params, request, response }: HttpContext) {
    const { done } = await request.validateUsing(updateTaskValidator)

    const todo = await Todo.findByOrFail({ id: params.id })

    todo.done = Boolean(done)

    await todo.save()

    return response.redirect().back()
  }

  async delete({ params, response }: HttpContext) {
    const todo = await Todo.findByOrFail({ id: params.id })

    todo.delete()

    return response.redirect().back()
  }
}
