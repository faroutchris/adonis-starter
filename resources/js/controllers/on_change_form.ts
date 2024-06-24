import { Controller } from '@hotwired/stimulus'

export default class OnChangeFormController extends Controller {
  submit() {
    const form = this.element as HTMLFormElement
    form.requestSubmit()
  }
}
