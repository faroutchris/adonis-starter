import { Controller } from '@hotwired/stimulus'

export default class NotificationController extends Controller {
  timeoutId: NodeJS.Timeout | undefined

  connect() {
    this.timeoutId = setTimeout(() => {
      this.element.remove()
    }, 6000)
  }

  disconnect(): void {
    clearTimeout(this.timeoutId)
    this.element.remove()
  }
}
