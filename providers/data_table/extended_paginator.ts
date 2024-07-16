import { SimplePaginator } from '@adonisjs/lucid/database'
import { SimplePaginatorContract } from '@adonisjs/lucid/types/querybuilder'
import { DatatableConfig } from './data_table.js'
import { LucidModel } from '@adonisjs/lucid/types/model'

interface ExtendedPaginatorContract<Result> extends SimplePaginatorContract<Result> {
  clearSearch(q: Record<string, string>): string
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
    const order = this.getQueryString('order') === 'desc' ? 'asc' : 'desc'
    const newQueryString = this.appendQueryString({ sort, order })

    return `${newQueryString}`
  }

  getSortOrderFor(sort: string) {
    if (this.getQueryString('sort') === sort) {
      return this.getQueryString('order') || null
    }
    return null
  }

  generatePaginationRange(current: number, total: number) {
    const center = [current - 2, current - 1, current, current + 1, current + 2]
    const filteredCenter = center.filter((p) => p > 1 && p < total)
    const includeThreeLeft = current === 5
    const includeThreeRight = current === total - 4
    const includeLeftDots = current > 5
    const includeRightDots = current < total - 4

    if (includeThreeLeft) filteredCenter.unshift(2)
    if (includeThreeRight) filteredCenter.push(total - 1)

    if (includeLeftDots) filteredCenter.unshift('...')
    if (includeRightDots) filteredCenter.push('...')

    return [1, ...filteredCenter, total]
  }
}
