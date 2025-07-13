import { Controller } from '@hotwired/stimulus'

export default class AutofocusController extends Controller<HTMLInputElement> {
  connect() {
    this.element.focus()
    this.element.setSelectionRange(0, this.element.value.length)
  }
}
