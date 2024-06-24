import Todo from '#models/todo'
import { saveTaskValidator, updateTaskValidator } from '#validators/todo'
import type { HttpContext } from '@adonisjs/core/http'

export default class TodosController {
  async index({ view }: HttpContext) {
    const todos = await Todo.all()

    return view.render('pages/todos/index', { todos })
  }

  async save({ request, response, session }: HttpContext) {
    const { title } = await request.validateUsing(saveTaskValidator)

    session.flash('success', 'Added a new todo')

    await Todo.create({ title })

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
