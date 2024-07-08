import Datatable, { DatatableConfig } from '#extensions/datatable/data_table'
import { HttpContext } from '@adonisjs/core/http'
import type { ApplicationService } from '@adonisjs/core/types'
import { DatabaseQueryBuilder } from '@adonisjs/lucid/database'
import { ModelQueryBuilder } from '@adonisjs/lucid/orm'
import { LucidModel } from '@adonisjs/lucid/types/model'
import { SimplePaginatorContract } from '@adonisjs/lucid/types/querybuilder'

/**
 * Declare datatable on the contract namespaces
 */

declare module '@adonisjs/lucid/types/querybuilder' {
  export interface ChainableContract {
    datatable: (
      ctx: HttpContext,
      config: DatatableConfig
    ) => Promise<SimplePaginatorContract<LucidModel>>
  }
}

declare module '@adonisjs/lucid/database' {
  interface DatabaseQueryBuilder {
    datatable: (
      ctx: HttpContext,
      config: DatatableConfig
    ) => Promise<SimplePaginatorContract<LucidModel>>
  }
}

declare module '@adonisjs/lucid/orm' {
  interface ModelQueryBuilder {
    datatable: (
      ctx: HttpContext,
      config: DatatableConfig
    ) => Promise<SimplePaginatorContract<LucidModel>>
  }
}

/**
 * Apply the macros on boot
 */

export default class DatatableBuilderProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * The container bindings have booted
   */
  async boot() {
    DatabaseQueryBuilder.macro('datatable', function (ctx: HttpContext, config: DatatableConfig) {
      // @ts-ignore
      const self = this as DatabaseQueryBuilder

      return new Datatable(() => self, config).create(ctx)
    })

    ModelQueryBuilder.macro('datatable', function (ctx: HttpContext, config: DatatableConfig) {
      // @ts-ignore
      const self = this as DatabaseQueryBuilder

      return new Datatable(() => self, config).create(ctx)
    })
  }
}
