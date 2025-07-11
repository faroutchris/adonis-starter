import Form from '#models/form'
import type { HttpContext } from '@adonisjs/core/http'

export default class FormBuildersController {
  async index({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const forms = await Form.query()
      .select(['title', 'email', 'published', 'id'])
      .where('userId', user.id)

    return view.render('pages/forms/index', { forms })
  }

  async save({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    await Form.create({
      userId: user.id,
      title: 'HelloWorld Form',
      email: 'christo.georgiev@gmail.com',
      published: true,
    })

    return response.redirect().back()
  }

  async show({ request, view }: HttpContext) {
    const form = await Form.query()
      .select(['title', 'email', 'published', 'id'])
      .preload('fields')
      .where('id', request.param('uuid'))
      .firstOrFail()

    return view.render('pages/forms/show', { form })
  }
}
