import { Controller } from '@hotwired/stimulus'
import { TurboEvents } from '../event_listeners.js'

export default class ClearFormController extends Controller<HTMLFormElement> {
  static targets = ['focus']

  declare readonly hasFocusTarget: boolean
  declare readonly focusTarget: HTMLInputElement
  declare readonly focusTargets: HTMLInputElement[]

  #afterSubmit = this.afterSubmit.bind(this)

  connect(): void {
    document.addEventListener(TurboEvents.SubmitEnd, this.#afterSubmit)
  }

  disconnect(): void {
    document.removeEventListener(TurboEvents.SubmitEnd, this.#afterSubmit)
  }

  afterSubmit() {
    this.element.reset()
  }
}
