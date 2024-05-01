import MarkdownFileService, { MarkdownData } from '#services/markdown_file_service'
import { DateTime } from 'luxon'

export default class Article {
  declare slug: string

  declare title: string

  declare html: string

  declare pubDate: DateTime

  declare description: string

  declare author: string

  declare tags: string[]

  declare image: {
    url: string
    alt: string
  }

  private static constructFromMarkdown(markdown: MarkdownData) {
    const article = new Article()
    article.author = markdown.frontmatter?.author
    article.description = markdown.frontmatter?.description
    article.image = markdown.frontmatter?.image
    article.pubDate = DateTime.fromJSDate(new Date(markdown.frontmatter?.pubDate))
    article.slug = markdown.slug
    article.tags = markdown.frontmatter.tags
    article.html = markdown.article.contents
    article.title = markdown.frontmatter?.title

    return article
  }

  static async findAll() {
    const slugs = await MarkdownFileService.getSlugs()
    const collection = await MarkdownFileService.readAll(slugs)
    return collection.map(this.constructFromMarkdown)
  }

  static async findOne(slug: string) {
    const markdown = await MarkdownFileService.read(slug)
    return this.constructFromMarkdown(markdown)
  }
}
