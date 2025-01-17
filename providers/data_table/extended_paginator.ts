import { SimplePaginator } from '@adonisjs/lucid/database'
import { SimplePaginatorContract } from '@adonisjs/lucid/types/querybuilder'
import { DatatableConfig } from './data_table.js'
import { LucidModel } from '@adonisjs/lucid/types/model'

interface ExtendedPaginatorContract<Result> extends SimplePaginatorContract<Result> {
  clearSearch(q: Record<string, string>): string
  appendQueryString(qs: Record<string, string>): string
  getQueryString(k: string): string
  toggleSortOrder(sort: string): string
  getSortOrderFor(k: string): string | null
}

export default class ExtendedPaginator<Result>
  extends SimplePaginator
  implements ExtendedPaginatorContract<Result>
{
  declare dtBaseUrl: string
  declare model: LucidModel | null
  declare config: DatatableConfig

  constructor(
    config: DatatableConfig,
    queryString: Record<string, string>,
    totalNumber: number,
    perPage: number,
    currentPage: number,
    ...rows: Result[]
  ) {
    super(totalNumber, perPage, currentPage, ...rows)
    this.dtBaseUrl = config.baseUrl
    this.baseUrl(config.baseUrl)
    this.queryString(queryString)
  }

  constructQueryStringFrom(qs: Record<string, string>) {
    return Object.entries(qs)
      .map(([key, val]) => `${key}=${val}`)
      .join('&')
  }

  clearSearch() {
    // @ts-ignore
    const qs = { ...this.qs }
    delete qs.search // remove search
    delete qs.page // reset page
    const newQueryString = this.constructQueryStringFrom(qs)
    return newQueryString.length ? `${this.dtBaseUrl}?${newQueryString}` : this.dtBaseUrl
  }

  appendQueryString(appendedQs: Record<string, string>) {
    // @ts-ignore
    const qs = { ...this.qs, ...appendedQs }
    const newQueryString = this.constructQueryStringFrom(qs)
    return `${this.dtBaseUrl}?${newQueryString}`
  }

  getQueryString(key: string) {
    // @ts-ignore
    return this.qs[key]
  }

  toggleSortOrder(sort: string) {
    const order = this.getQueryString('order') === 'asc' ? 'desc' : 'asc'
    const newQueryString = this.appendQueryString({ sort, order })

    return `${newQueryString}`
  }

  getSortOrderFor(sort: string) {
    if (this.getQueryString('sort') === sort) {
      return this.getQueryString('order') || null
    }
    return null
  }
}
