import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class TurboMiddleware {
  resolveValidationErrors(ctx: HttpContext) {
    const { session } = ctx

    /**
     * If not a Vine Validation error, then return the entire error bag
     */
    if (!session.flashMessages.has('errorsBag.E_VALIDATION_ERROR')) {
      return session.flashMessages.get('errorsBag')
    }

    /**
     * Otherwise, resolve the validation errors. We only keep the first
     * error message for each field
     */
    const errors = Object.entries(session.flashMessages.get('inputErrorsBag')).reduce(
      (acc, [field, messages]) => {
        acc[field] = Array.isArray(messages) ? messages[0] : messages
        return acc
      },
      {} as Record<string, string>
    )

    return errors
  }

  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    // console.log('flash: ', ctx.session.flashMessages)
    const errors = this.resolveValidationErrors(ctx)

    ctx.view.share({
      isTurboFrameRequest: !!ctx.request.headers()['x-turbo-request-id'],
      errors: errors,
    })

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
