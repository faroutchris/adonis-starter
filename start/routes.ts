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
import { HttpContext } from '@adonisjs/core/http'

const EmployeesController = () => import('#controllers/employees_controller')
const FormBuildersController = () => import('#controllers/form_builders_controller')
const TodosController = () => import('#controllers/todos_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const PasswordResetController = () => import('#controllers/auth/password_reset_controller')
const LoginController = () => import('#controllers/auth/login_controller')
const LogoutController = () => import('#controllers/auth/logout_controller')
const RegisterController = () => import('#controllers/auth/register_controller')
const ArticlesController = () => import('#controllers/articles_controller')

/*
|--------------------------------------------------------------------------
| Landing
|--------------------------------------------------------------------------
|
| Marketing and landing pages
|
*/

router.on('/').render('pages/home').as('home')

/*
|--------------------------------------------------------------------------
| Articles
|--------------------------------------------------------------------------
|
| Blog routes and pages
|
*/

router.get('/articles', [ArticlesController, 'index']).as('articles.index')

router
  .get('/articles/:slug', [ArticlesController, 'show'])
  .as('articles.show')
  .where('slug', router.matchers.slug())

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
|
| Route group for authentication
|
*/

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

/*
|--------------------------------------------------------------------------
| Password reset
|--------------------------------------------------------------------------
|
| Routes for password reset and verification flow
|
*/

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

/*
|--------------------------------------------------------------------------
| Profiles
|--------------------------------------------------------------------------
|
| Edit and view profile information
|
*/

router.get('/profiles/me', [ProfilesController, 'index']).as('profiles.show').use(middleware.auth())

router
  .get('/profiles/edit', [ProfilesController, 'show'])
  .as('profiles.edit')
  .use(middleware.auth())

router
  .post('/profiles/edit', [ProfilesController, 'update'])
  .as('profiles.update')
  .use(middleware.auth())

/*
|--------------------------------------------------------------------------
| Todo App
|--------------------------------------------------------------------------
|
| Test out hotwire turbo and stimulus to create SPA-like app
|
*/

router.get('/todos', [TodosController, 'index']).as('todos.index').use(middleware.auth())
router.post('/todos', [TodosController, 'save']).as('todos.save').use(middleware.auth())
router.put('/todos/:id', [TodosController, 'update']).as('todos.update').use(middleware.auth())
router.delete('/todos/:id', [TodosController, 'delete']).as('todos.delete').use(middleware.auth())
router.get('/todos/lazyloaded', [TodosController, 'lazy']).as('todos.lazy').use(middleware.auth())

/*
|--------------------------------------------------------------------------
| Employee datatable
|--------------------------------------------------------------------------
|
| Test out some more advanced features for hotwire
|
*/

router
  .group(() => {
    router.get('/', [EmployeesController, 'index']).as('employees.index').use(middleware.auth())

    router
      .get('/create', [EmployeesController, 'create'])
      .as('employees.create')
      .use(middleware.auth())

    router
      .get('/edit/:id', [EmployeesController, 'edit'])
      .as('employees.edit')
      .use(middleware.auth())

    router.post('', [EmployeesController, 'store']).as('employees.store').use(middleware.auth())

    router
      .delete('/:id', [EmployeesController, 'delete'])
      .as('employees.delete')
      .use(middleware.auth())

    router
      .put('/edit/:id', [EmployeesController, 'update'])
      .as('employees.update')
      .use(middleware.auth())
  })
  .prefix('/employees')
  .use(middleware.auth())

/*
|--------------------------------------------------------------------------
| Form Builder App
|--------------------------------------------------------------------------
|
| Form builder app and dashboard
|
*/

router
  .post('/:uuid', (ctx: HttpContext) => {
    return ctx.view.renderRaw('Success')
  })
  .where('uuid', router.matchers.uuid())
  .middleware(middleware.unsafeShield())
router
  .get('/forms', [FormBuildersController, 'index'])
  .as('formbuilder.index')
  .use(middleware.auth())
router
  .post('/forms', [FormBuildersController, 'save'])
  .as('formbuilder.save')
  .use(middleware.auth())
router
  .get('/forms/:uuid', [FormBuildersController, 'show'])
  .as('formbuilder.show')
  .where('uuid', router.matchers.uuid())
