import Article from '#models/article'

export default class ArticlesService {
  static orderByDate(direction: 'asc' | 'desc', articles: Article[]) {
    return articles.sort((a, b) => {
      const unixA = a.pubDate.toUnixInteger()
      const unixB = b.pubDate.toUnixInteger()
      return direction === 'asc' ? unixA - unixB : unixB - unixA
    })
  }

  static extractTags(articles: Article[]) {
    return [...new Set(articles.flatMap((article) => article.tags))]
  }

  static extractAuthors(articles: Article[]) {
    return [...new Set(articles.map((article) => article.author))]
  }

  private static filterByTag(tag: string, articles: Article[]) {
    return articles.filter((article) => article.tags.some((_tag) => _tag === tag))
  }

  private static filterByAuthor(author: string, articles: Article[]) {
    return articles.filter((article) => article.author === author)
  }

  static filterByQuery({ tag, author }: Record<string, string>, articles: Article[]) {
    if (!tag && !author) return articles
    if (tag) articles = ArticlesService.filterByTag(tag, articles)
    if (author) articles = ArticlesService.filterByAuthor(author, articles)
    return articles
  }
}
