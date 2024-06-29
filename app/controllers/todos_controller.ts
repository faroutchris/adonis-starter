import Todo from '#models/todo'
import { saveTaskValidator, updateTaskValidator } from '#validators/todo'
import { TodoIndexRender } from '#views/todos_index_render'
import type { HttpContext, Request } from '@adonisjs/core/http'

export default class TodosController {
  async index({ turboFrame, request }: HttpContext) {
    const todos = await Todo.all()

    const showPriority = !this.getPriority(request)

    return turboFrame.render('pages/todos/index', { todos, showPriority })
  }

  async save(ctx: HttpContext) {
    const { request, turboStream } = ctx
    const { title } = await request.validateUsing(saveTaskValidator)

    const todo = await Todo.create({ title })
    const notification = `Added a new todo ${todo.id}`

    return turboStream.renderUsing(new TodoIndexRender(ctx, { todo, notification }))
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

  // Could be on a service
  private getPriority(request: Request) {
    const qs = request.qs() as { show: string }

    return qs.show === undefined || qs.show === 'true'
  }
}
