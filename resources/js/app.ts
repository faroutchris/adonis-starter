import '../css/bootstrap.min.css'
import 'bootstrap'
import '@hotwired/turbo'
import { Application } from '@hotwired/stimulus'
import OnChangeFormController from './controllers/on_change_form.js'

declare global {
  interface Window {
    Stimulus: Application
  }
}

window.Stimulus = Application.start()
window.Stimulus.register('onchangeform', OnChangeFormController)
