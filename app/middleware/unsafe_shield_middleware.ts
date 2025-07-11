import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import helmetCsp from 'helmet-csp'

/*
|--------------------------------------------------------------------------
| Unsafe Shield middleware
|--------------------------------------------------------------------------
|
| This middleware allows specific routes to turn off the default content
| security policies. This is useful when you want any third party site
| to be able to post forms to an endpoint on this backend.
| 
| It's unsafe because obviously it turns off safety features that disallow
| common hacks.
|
*/

export default class UnsafeShieldMiddleware {
  csp(ctx: HttpContext, options: Record<string, any>) {
    const helmetCspMiddleware = (helmetCsp as unknown as typeof helmetCsp.default)(options)

    return new Promise<void>((resolve, reject) => {
      /**
       * Generating nonce
       */
      ctx.response.nonce = string.generateRandom(16)

      /**
       * Helmet csp needs the `nonce` property on the HTTP ServerResponse
       */
      ctx.response.response.nonce = ctx.response.nonce

      /**
       * Optionally share nonce with templates
       */
      if ('view' in ctx) {
        ctx.view.share({ cspNonce: ctx.response.nonce })
      }

      /**
       * Give request to helmet
       */
      helmetCspMiddleware(ctx.response.request, ctx.response.response, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  async handle(ctx: HttpContext, next: NextFn) {
    // Disable csp stuff
    await this.csp(ctx, {
      useDefaults: false,
      directives: {
        defaultSrc: [`'*'`],
        formAction: [`'*'`],
      },
      reportOnly: false,
    })

    // disable frameguard
    ctx.response.removeHeader('X-Frame-Options')

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
