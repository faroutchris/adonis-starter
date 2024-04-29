import Article from '#models/article'
import type { HttpContext } from '@adonisjs/core/http'

export default class ArticlesController {
  async index({ view }: HttpContext) {
    const articles = await Article.findAll()
    return view.render('pages/articles/index', { articles })
  }

  async show({ view, params }: HttpContext) {
    const article = await Article.findOne(params.slug)
    return view.render('pages/articles/show', { article })
  }
}
