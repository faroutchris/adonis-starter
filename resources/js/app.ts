import '../css/bootstrap.min.css'
import 'bootstrap'
import '@hotwired/turbo'
import { Application } from '@hotwired/stimulus'
import OnChangeFormController from './controllers/on_change_form.js'
import NotificationController from './controllers/notification.js'
import FormItController from './controllers/form_it.js'
import ClearFormController from './controllers/clear_form.js'
import ForceReloadController from './controllers/force_reload.js'

declare global {
  interface Window {
    Stimulus: Application
  }
}

window.Stimulus = Application.start()
window.Stimulus.register('form-it', FormItController)
window.Stimulus.register('onchangeform', OnChangeFormController)
window.Stimulus.register('notification', NotificationController)
window.Stimulus.register('clear-form', ClearFormController)
window.Stimulus.register('force-reload', ForceReloadController)
