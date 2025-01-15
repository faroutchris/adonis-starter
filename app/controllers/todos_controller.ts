import Todo from '#models/todo'
import { saveTaskValidator, updateTaskValidator } from '#validators/todo'
import type { HttpContext } from '@adonisjs/core/http'

export default class TodosController {
  private templates = {
    index: 'pages/todos/index',
    taskPartial: 'pages/todos/_task',
    notificationPartial: 'pages/todos/_success_notification',
    lazyPartial: 'pages/todos/_lazy',
  }

  async index({ turboFrame }: HttpContext) {
    const todos = await Todo.all()
    return turboFrame.render(this.templates.index, { todos })
  }

  async save({ request, response, session, turboStream }: HttpContext) {
    // const res = await saveTaskValidator.validate(request.all()).catch((err) => {
    //   console.log(err)
    //   return { title: '' }
    // })

    // const { title } = res
    const { title } = await request.validateUsing(saveTaskValidator)
    const todo = await Todo.create({ title })

    // const success = `Added a new todo ${todo.id}`

    session.flash('success', `Added a new todo ${todo.id}`)

    if (turboStream.isTurboStream()) {
      return (
        turboStream
          .prepend(this.templates.taskPartial, { todo }, 'task-list')
          // .prepend(this.templates.notificationPartial, { success }, 'toast-notification')
          .render()
      )
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

  async delete({ params, response, turboStream, session }: HttpContext) {
    const todo = await Todo.findByOrFail({ id: params.id })

    todo.delete()

    if (turboStream.isTurboStream()) {
      return turboStream
        .remove(`todo-${todo.id}`)
        .prepend(
          this.templates.notificationPartial,
          { success: `Deleted todo ${todo.id}` },
          'toast-notification'
        )
        .render()
    }

    session.flash('success', `Deleted todo ${todo.id}`)

    return response.redirect().back()
  }

  async lazy({ turboFrame }: HttpContext) {
    // Mock long running query
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          turboFrame.render(this.templates.lazyPartial, {
            message: 'My eager loaded message',
          })
        )
      }, 200)
    })
  }
}
