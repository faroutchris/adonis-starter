import Todo from '#models/todo'
import { saveTaskValidator, updateTaskValidator } from '#validators/todo'
import type { HttpContext, Request } from '@adonisjs/core/http'

export default class TodosController {
  todo = 'pages/todos/_task'

  message = 'pages/todos/_success_notification'

  async index({ turboFrame, request }: HttpContext) {
    const todos = await Todo.all()

    const showPriority = !this.getPriority(request)

    return turboFrame.render('pages/todos/index', { todos, showPriority })
  }

  async save({ request, response, session, turboStream }: HttpContext) {
    const { title } = await request.validateUsing(saveTaskValidator)

    const todo = await Todo.create({ title })
    const notification = `Added a new todo ${todo.id}`

    if (turboStream.isTurboStream()) {
      console.log(this.todo)
      return turboStream
        .prepend(this.todo, { todo }, 'task-list')
        .update(this.message, { notification }, 'toast-notification')
        .render()
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

  async delete({ params, response, turboStream }: HttpContext) {
    const todo = await Todo.findByOrFail({ id: params.id })

    todo.delete()

    if (turboStream.isTurboStream()) {
      return turboStream.remove(`todo-${todo.id}`).render()
    }

    return response.redirect().back()
  }

  // Could be on a service
  private getPriority(request: Request) {
    const qs = request.qs() as { show: string }

    return qs.show === undefined || qs.show === 'true'
  }
}
