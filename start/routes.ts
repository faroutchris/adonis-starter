/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const ArticlesController = () => import('#controllers/articles_controller')
const RegisterController = () => import('#controllers/auth/register_controller')

router.on('/').render('pages/home').as('home')

router.get('/articles', [ArticlesController, 'index']).as('articles.index')

router
  .get('/articles/:slug', [ArticlesController, 'show'])
  .as('articles.show')
  .where('slug', router.matchers.slug())

router
  .group(() => {
    router.get('/register', [RegisterController, 'show']).as('register.show')

    router.post('/register', [RegisterController, 'store']).as('register.store')
  })
  .prefix('/auth')
  .as('auth')
