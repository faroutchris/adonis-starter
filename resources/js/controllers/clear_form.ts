import { Controller } from '@hotwired/stimulus'

export default class ClearFormController extends Controller<HTMLFormElement> {
  static targets = ['focus']

  declare readonly hasFocusTarget: boolean
  declare readonly focusTarget: HTMLInputElement
  declare readonly focusTargets: HTMLInputElement[]

  #afterSubmit = this.afterSubmit.bind(this)

  connect(): void {
    document.addEventListener('turbo:submit-end', this.#afterSubmit)
  }

  disconnect(): void {
    document.removeEventListener('turbo:submit-end', this.#afterSubmit)
  }

  afterSubmit() {
    this.element.reset()
    this.focusTarget.focus()
  }
}
