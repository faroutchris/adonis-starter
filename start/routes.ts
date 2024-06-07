/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const PasswordResetController = () => import('#controllers/auth/password_reset_controller')
const LoginController = () => import('#controllers/auth/login_controller')
const LogoutController = () => import('#controllers/auth/logout_controller')
const RegisterController = () => import('#controllers/auth/register_controller')
const ArticlesController = () => import('#controllers/articles_controller')

router.on('/').render('pages/home').as('home')

router.get('/articles', [ArticlesController, 'index']).as('articles.index')

router
  .get('/articles/:slug', [ArticlesController, 'show'])
  .as('articles.show')
  .where('slug', router.matchers.slug())

router
  .group(() => {
    router.get('/login', [LoginController, 'show']).as('login.show').use(middleware.guest())
    router.post('/login', [LoginController, 'store']).as('login.store').use(middleware.guest())

    router
      .get('/register', [RegisterController, 'show'])
      .as('register.show')
      .use(middleware.guest())
    router
      .post('/register', [RegisterController, 'store'])
      .as('register.store')
      .use(middleware.guest())

    router.post('/logout', [LogoutController, 'handle']).as('logout').use(middleware.auth())
  })
  .prefix('/auth')
  .as('auth')

router
  .get('/password/reset/:token', [PasswordResetController, 'verify'])
  .as('reset.verify')
  .use(middleware.guest())

router
  .get('/password/reset', [PasswordResetController, 'show'])
  .as('reset.show')
  .use(middleware.guest())

router
  .post('/password/reset/update', [PasswordResetController, 'update'])
  .as('reset.update')
  .use(middleware.guest())

router
  .post('/password/reset', [PasswordResetController, 'send'])
  .as('reset.send')
  .use(middleware.guest())
