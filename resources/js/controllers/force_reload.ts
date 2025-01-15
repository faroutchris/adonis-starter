import { Controller } from '@hotwired/stimulus'

export default class ForceReloadController extends Controller<HTMLFormElement> {
  connect(): void {
    window.setTimeout(() => {
      window.location.reload()
    }, 4000)
  }
}
