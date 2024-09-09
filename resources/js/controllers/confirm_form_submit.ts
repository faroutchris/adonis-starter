import { Controller } from '@hotwired/stimulus'

export default class ConfirmFormSubmitController extends Controller {
  declare readonly formTarget: HTMLFormElement

  static targets = ['form']

  submit() {
    const isConfirmed = confirm('Are you sure?')

    if (isConfirmed) {
      console.log(this.element)
      ;(this.element as HTMLFormElement).submit()
    }
  }
}
