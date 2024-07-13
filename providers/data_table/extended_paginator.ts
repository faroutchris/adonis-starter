import { SimplePaginator } from '@adonisjs/lucid/database'
import { SimplePaginatorContract } from '@adonisjs/lucid/types/querybuilder'

interface ExtendedPaginatorContract<Result> extends SimplePaginatorContract<Result> {
  clearSearch(q: Record<string, string>): string
}

export default class ExtendedPaginator<Result>
  extends SimplePaginator
  implements ExtendedPaginatorContract<Result>
{
  constructor(totalNumber: number, perPage: number, currentPage: number, ...rows: Result[]) {
    super(totalNumber, perPage, currentPage, ...rows)
  }

  // Custom methods
  clearSearch(q: Record<string, string>) {
    const newQs = { ...q }
    delete newQs.search
    let str = Object.entries(newQs)
      .map(([key, val]) => `${key}=${val}`)
      .join('&')
    return `${this.getUrl(1)}?${str}`
  }
}
