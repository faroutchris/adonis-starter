import 'bootstrap'
import * as Turbo from '@hotwired/turbo'
import { Application } from '@hotwired/stimulus'
import OnChangeFormController from './controllers/on_change_form.js'
import NotificationController from './controllers/notification.js'
import FormItController from './controllers/form_it.js'
import ClearFormController from './controllers/clear_form.js'
import ForceReloadController from './controllers/force_reload.js'
import DialogController from './controllers/dialog.js'
import AutofocusController from './controllers/autofocus.js'
import InputValidationController from './controllers/input_validation.js'
import { StreamActions } from '@hotwired/turbo'

declare global {
  interface Window {
    Stimulus: Application
    Turbo: typeof Turbo
  }
}

window.Stimulus = Application.start()
window.Turbo = Turbo

window.Stimulus.register('form-it', FormItController)
window.Stimulus.register('onchangeform', OnChangeFormController)
window.Stimulus.register('notification', NotificationController)
window.Stimulus.register('clear-form', ClearFormController)
window.Stimulus.register('force-reload', ForceReloadController)
window.Stimulus.register('dialog', DialogController)
window.Stimulus.register('autofocus', AutofocusController)
window.Stimulus.register('input-validation', InputValidationController)

// Wait for DOM to be ready and then register the custom action

StreamActions.invoke = function () {
  const target = this.getAttribute('target')
  const method = this.getAttribute('method')
  const argsString = this.getAttribute('args')

  if (!target || !method) {
    console.warn('Invalid invoke action attributes:', { target, method })
    return
  }

  // Parse arguments safely
  let args = []
  if (argsString) {
    try {
      args = JSON.parse(argsString)
      if (!Array.isArray(args)) {
        console.warn('Invoke action args must be an array, got:', typeof args)
        args = []
      }
    } catch (error) {
      console.warn('Failed to parse invoke action args:', argsString, error)
      args = []
    }
  }

  // Find target elements
  const targetElements = document.querySelectorAll(target)
  if (targetElements.length === 0) {
    console.warn(`No elements found for invoke target selector: ${target}`)
    return
  }

  // Process each target element
  targetElements.forEach((targetElement) => {
    const stimulus = window.Stimulus
    if (!stimulus) {
      console.warn('Stimulus application not found')
      return
    }

    // Find controller with the method
    let controllerFound = false
    const controllerNames = getControllerNamesFromElement(targetElement)

    for (const controllerName of controllerNames) {
      const controller = findControllerForElement(targetElement, controllerName, stimulus)
      if (controller && typeof controller[method] === 'function') {
        try {
          console.log(`Calling ${method} on controller ${controllerName} with args:`, args)
          controller[method](...args)
          controllerFound = true
          break
        } catch (error) {
          console.error(`Error calling method ${method} on controller ${controllerName}:`, error)
        }
      }
    }

    if (!controllerFound) {
      console.warn(`Method ${method} not found on any controller for element:`, targetElement)
    }
  })
}

// Helper functions for the invoke action
function getControllerNamesFromElement(element: any): string[] {
  const controllerNames: string[] = []
  const controllerAttr = element.getAttribute('data-controller')
  if (controllerAttr) {
    controllerNames.push(...controllerAttr.split(' ').filter((name: string) => name.trim()))
  }
  return controllerNames
}

function findControllerForElement(element: Element, identifier: string, stimulus: any): any {
  try {
    // Try the standard Stimulus API first
    if (stimulus.getControllerForElementAndIdentifier) {
      return stimulus.getControllerForElementAndIdentifier(element, identifier)
    }

    // Fallback: check if the router has the controller
    if (stimulus.router && stimulus.router.controllersByIdentifier) {
      const controllers = stimulus.router.controllersByIdentifier.get(identifier)
      if (controllers) {
        // Find controller that matches this element
        for (const controller of controllers) {
          if (controller.element === element) {
            return controller
          }
        }
      }
    }

    return null
  } catch (error) {
    console.warn(`Error finding controller ${identifier}:`, error)
    return null
  }
}
