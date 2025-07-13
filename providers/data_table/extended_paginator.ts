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
  declare _qs: Record<string, string>

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

  // Extends and wraps SimplePaginator query strings since it's private
  queryString(values: { [key: string]: any }): this {
    this._qs = values
    super.queryString(this._qs)
    return this
  }

  get queryStringValues(): Readonly<Record<string, any>> {
    return this._qs
  }

  private constructQueryStringFrom(qs: Record<string, string>) {
    return Object.entries(qs)
      .map(([key, val]) => `${key}=${val}`)
      .join('&')
  }

  clearQueryStrings(queryStrings: string[]) {
    const qs = { ...this._qs }

    queryStrings.forEach((queryString) => {
      delete qs[queryString]
    })

    const newQueryString = this.constructQueryStringFrom(qs)
    return newQueryString.length ? `${this.dtBaseUrl}?${newQueryString}` : this.dtBaseUrl
  }

  appendQueryString(appendedQs: Record<string, string>) {
    const qs = { ...this._qs, ...appendedQs }
    const newQueryString = this.constructQueryStringFrom(qs)
    return `${this.dtBaseUrl}?${newQueryString}`
  }

  getQueryString(key: string) {
    return this._qs[key]
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
