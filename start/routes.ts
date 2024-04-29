/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const ArticlesController = () => import('#controllers/articles_controller')
import router from '@adonisjs/core/services/router'

router.on('/').render('pages/home').as('home')

router.get('/articles', [ArticlesController, 'index']).as('articles.index')

router
  .get('/articles/:slug', [ArticlesController, 'show'])
  .as('articles.show')
  .where('slug', router.matchers.slug())
