import TurboFrame from '#providers/turbo/turbo_frame'
import TurboStream from '#providers/turbo/turbo_stream'
import { HttpContext } from '@adonisjs/core/http'
import type { ApplicationService } from '@adonisjs/core/types'
import { parse } from 'node-html-parser'
import { ValidationManager } from './validation/validation_manager.js'
import { ErrorExtractor } from './validation/error_extractor.js'
import { FieldMapper } from './validation/field_mapper.js'
// Import types to ensure the HttpContext extension is loaded
import './validation/types.js'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    turboStream: TurboStream
    turboFrame: TurboFrame
  }
}

export default class TurboProvider {
  constructor(protected app: ApplicationService) {}
  /**
   * The container bindings have booted
   */
  async boot() {
    HttpContext.getter('turboStream', function () {
      // @ts-ignore
      const self = this as HttpContext
      return new TurboStream(self)
    })

    HttpContext.getter('turboFrame', function () {
      // @ts-ignore
      const self = this as HttpContext
      return new TurboFrame(self, parse)
    })

    HttpContext.getter('validationManager', function () {
      // @ts-ignore
      const self = this as HttpContext
      const errorExtractor = new ErrorExtractor()
      const fieldMapper = new FieldMapper()
      return new ValidationManager(self, self.turboStream, errorExtractor, fieldMapper)
    })

    // Todo Add turbo view helpers here:
    // ctx.view.share({ isTurboFrame: ctx.turboFrame.isTurboFrame() })
  }
}
