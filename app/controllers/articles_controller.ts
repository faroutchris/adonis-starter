import Article from '#models/article'
import type { HttpContext } from '@adonisjs/core/http'

export default class ArticlesController {
  async index({ view, request }: HttpContext) {
    let articles = await Article.findAll().then((_articles) =>
      Article.orderByDate('asc', _articles)
    )
    const tags = Article.extractTags(articles)
    const queryString = request.qs()
    if (queryString.filter) articles = Article.filterByTag(queryString.filter, articles)
    return view.render('pages/articles/index', { articles, tags, queryString })
  }

  async show({ view, params }: HttpContext) {
    const article = await Article.findOne(params.slug)
    return view.render('pages/articles/show', { article })
  }
}
