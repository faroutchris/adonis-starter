import Todo from '#models/todo'
import { saveTaskValidator, updateTaskValidator } from '#validators/todo'
import type { HttpContext } from '@adonisjs/core/http'

export default class TodosController {
  todo = 'pages/todos/_task'
  message = 'pages/todos/_success_notification'

  async index({ turboFrame }: HttpContext) {
    const todos = await Todo.all()

    return turboFrame.render('pages/todos/index', { todos })
  }

  async save({ request, response, session, turboStream }: HttpContext) {
    const { title } = await request.validateUsing(saveTaskValidator)

    const todo = await Todo.create({ title })
    const notification = `Added a new todo ${todo.id}`
    session.flash('success', notification)

    if (turboStream.isTurboStream()) {
      return turboStream
        .prepend(this.todo, { todo }, 'task-list')
        .update(this.message, { notification }, 'toast-notification')
        .render()
    }

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

  async lazy({ turboFrame }: HttpContext) {
    // Mock long running query
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          turboFrame.render('pages/todos/_lazy', {
            message: 'My eager loaded message',
          })
        )
      }, 200)
    })
  }
}
