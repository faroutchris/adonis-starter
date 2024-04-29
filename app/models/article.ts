import MarkdownFileService from '#services/markdown_file_service'
import { DateTime } from 'luxon'

export default class Article {
  declare slug: string

  declare title: string

  declare html: string

  declare pubDate: DateTime

  declare description: string

  declare author: string

  declare image: {
    url: string
    alt: string
  }

  declare tags: string[]

  static async findAll() {
    const slugs = await MarkdownFileService.getSlugs()
    const collection = await MarkdownFileService.readAll(slugs)

    return collection.map((markdown) => {
      const article = new Article()
      article.author = markdown.frontmatter?.author
      article.description = markdown.frontmatter?.description
      article.image = markdown.frontmatter?.image
      article.pubDate = markdown.frontmatter?.pubDate
      article.slug = markdown.slug
      article.tags = markdown.frontmatter.tags
      article.html = markdown.article.contents
      article.title = markdown.frontmatter?.title

      return article
    })
  }

  static async findOne(slug: string) {
    const markdown = await MarkdownFileService.read(slug)
    const article = new Article()
    article.author = markdown.frontmatter?.author
    article.description = markdown.frontmatter?.description
    article.image = markdown.frontmatter?.image
    article.pubDate = markdown.frontmatter?.pubDate
    article.slug = markdown.slug
    article.tags = markdown.frontmatter.tags
    article.html = markdown.article.contents
    article.title = markdown.frontmatter?.title

    return article
  }
}
