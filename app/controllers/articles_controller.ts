import Article from '#models/article'
import ArticlesService from '#services/articles_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class ArticlesController {
  async index({ view, request }: HttpContext) {
    let articles = await Article.findAll()
    const tags = ArticlesService.extractTags(articles)
    const authors = ArticlesService.extractAuthors(articles)

    const { order, tag, author } = request.qs()
    articles = ArticlesService.orderByDate(order || 'asc', articles)
    articles = ArticlesService.filterByQuery({ tag, author }, articles)

    return view.render('pages/articles/index', {
      articles,
      tags,
      authors,
      order,
      filters: { tag, author },
    })
  }

  async show({ view, params }: HttpContext) {
    const article = await Article.findOne(params.slug)
    return view.render('pages/articles/show', { article })
  }
}
