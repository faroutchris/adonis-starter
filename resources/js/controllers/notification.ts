import { Controller } from '@hotwired/stimulus'

export default class AlertController extends Controller {
  connect() {
    window.setTimeout(() => {
      this.element.remove()
    }, 5000)
  }
}
