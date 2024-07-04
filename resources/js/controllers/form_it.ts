/**
 * Turns any HTML element into an entity that can perform HTTP requests
 * Supports http verbs: GET, POST, PUT and DELETE
 *
 * <button
 *  data-controller="form-it"
 *  data-form-it-method-value="POST"
 *  data-form-it-action-value="{{ route('todos.save') }}"
 *  data-form-it-csrf-value="{{ csrfToken }}"
 *  data-form-it-payload-value="{{ JSON.stringify({ title: 'value' }) }}"
 *  data-action="click->form-it#submit">
 *    Send
 * </button>
 */
import { Controller } from '@hotwired/stimulus'
import { ValueDefinitionMap } from '@hotwired/stimulus/dist/types/core/value_properties.js'

export default class FormItController extends Controller {
  declare methodValue: string
  declare readonly hasMethodValue: boolean

  declare actionValue: string
  declare readonly hasActionValue: boolean

  declare payloadValue: string
  declare readonly hasPayloadValue: boolean

  declare csrfValue: string
  declare readonly hasCsrfValue: boolean

  static values: ValueDefinitionMap = {
    method: String,
    action: String,
    payload: String,
    csrf: String,
  }

  submit() {
    const hiddenForm = document.createElement('form')
    const hiddenData = document.createElement('input')
    hiddenForm.setAttribute('method', this.methodValue)
    hiddenForm.setAttribute('action', this.actionValue)
    hiddenForm.setAttribute('style', 'display:none')

    const payload = JSON.parse(this.payloadValue)
    const key = Object.keys(payload)[0]
    const value = payload[key]

    if (hiddenForm && hiddenData) {
      if (this.hasCsrfValue) {
        const csrfInput = document.createElement('input')
        csrfInput.setAttribute('name', '_csrf')
        csrfInput.setAttribute('value', this.csrfValue)
        hiddenForm.append(csrfInput)
      }
      hiddenData.setAttribute('type', 'text')
      hiddenData.setAttribute('name', key)
      hiddenData.setAttribute('value', value)
      hiddenForm.append(hiddenData)
      document.body.append(hiddenForm)
      hiddenForm.requestSubmit()
    }
  }
}
