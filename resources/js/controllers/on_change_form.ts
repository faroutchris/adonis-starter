import { Controller } from '@hotwired/stimulus'

export default class OnChangeFormController extends Controller<HTMLFormElement> {
  submit() {
    const form = this.element
    form.requestSubmit()
  }
}
