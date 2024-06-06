import { Exception } from '@adonisjs/core/exceptions'
import app from '@adonisjs/core/services/app'
import { MarkdownFile } from '@dimerapp/markdown'
import { toHtml } from '@dimerapp/markdown/utils'
import { readFile, readdir } from 'node:fs/promises'

export type MarkdownData = {
  slug: string
  article: {
    contents: string
    summary?: string | undefined
    toc?: string | undefined
    excerpt?: string | undefined
  }
  frontmatter: {
    [key: string]: any
  }
}

// Figure out how IOC container works so I can create several instances of a Markdown service with different configuration for storage

export default class MarkdownFileService {
  private static isMarkdown(filename: string) {
    return filename.includes('.md')
  }

  private static extractSlug(filename: string) {
    return filename.replace('.md', '')
  }

  private static async readFile(slug: string) {
    try {
      const url = app.makeURL(`public/articles/${slug}.md`)
      return await readFile(url, 'utf-8')
    } catch (error) {
      throw new Exception(`Article not found: ${error.message}`, {
        code: 'E_NOT_FOUND',
        status: 404,
      })
    }
  }

  private static async process(file: string) {
    try {
      const markdown = new MarkdownFile(file)
      await markdown.process()
      return markdown
    } catch (error) {
      throw new Exception(`Processing error: ${error.message}`, {
        code: 'E_PROCESSING',
        status: 500,
      })
    }
  }

  static async getSlugs() {
    try {
      const dir = await readdir('public/articles')
      return dir.filter(this.isMarkdown).map(this.extractSlug)
    } catch (error) {
      throw new Exception(`Failed to get slugs: ${error.message}`, {
        code: 'E_PROCESSING',
        status: 500,
      })
    }
  }

  static async read(slug: string): Promise<MarkdownData> {
    const file = await this.readFile(slug)
    const markdown = await this.process(file)
    const article = toHtml(markdown)
    const frontmatter = markdown.frontmatter
    return { slug, article, frontmatter }
  }

  static async readAll(slugs: string[]) {
    const results = await Promise.allSettled(slugs.map((slug) => MarkdownFileService.read(slug)))
    return results
      .filter((result) => result.status === 'fulfilled')
      .map((_result) => {
        const result = _result as PromiseFulfilledResult<MarkdownData>
        return result.value
      })
  }
}
