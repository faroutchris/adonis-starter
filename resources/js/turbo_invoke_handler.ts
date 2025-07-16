/**
 * Turbo Stream Invoke Action Handler
 *
 * This module handles custom "invoke" actions in Turbo Streams that allow
 * calling Stimulus controller methods with arguments from server responses.
 */

/**
 * Finds a Stimulus controller for a given element and identifier
 */
function findControllerForElement(element: Element, identifier: string, stimulus: any): any {
  try {
    // Try the standard Stimulus API first
    if (stimulus.getControllerForElementAndIdentifier) {
      return stimulus.getControllerForElementAndIdentifier(element, identifier)
    }

    // Fallback: try to access controller through element's internal properties
    const elementWithController = element as any
    if (elementWithController.stimulusControllers) {
      return elementWithController.stimulusControllers[identifier]
    }

    // Another fallback: check if the router has the controller
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

/**
 * Finds any controller on the element or its parents that has the specified method
 */
function findAnyControllerWithMethod(element: Element, method: string, stimulus: any): any {
  try {
    let currentElement: Element | null = element

    while (currentElement) {
      const controllerNames = getControllerNamesFromElement(currentElement)

      for (const controllerName of controllerNames) {
        const controller = findControllerForElement(currentElement, controllerName, stimulus)
        if (controller && typeof controller[method] === 'function') {
          return controller
        }
      }

      // Move up to parent element
      currentElement = currentElement.parentElement
    }

    return null
  } catch (error) {
    console.warn('Error finding controller with method:', error)
    return null
  }
}

/**
 * Extracts controller names from element's data attributes
 */
function getControllerNamesFromElement(element: Element): string[] {
  const controllerNames: string[] = []

  // Check for data-controller attribute
  const controllerAttr = element.getAttribute('data-controller')
  if (controllerAttr) {
    controllerNames.push(...controllerAttr.split(' ').filter((name) => name.trim()))
  }

  return controllerNames
}

/**
 * Processes invoke action for a specific element by finding its Stimulus controller
 * and calling the specified method.
 */
function processElementInvoke(element: Element, method: string, args: any[]): void {
  try {
    console.log(`Processing invoke for element:`, element, `method: ${method}`, `args:`, args)

    const stimulus = (window as any).Stimulus
    if (!stimulus) {
      console.warn('Stimulus application not found')
      return
    }

    let controllerFound = false

    // Strategy 1: Try to find controller by checking data-controller attribute
    const controllerNames = getControllerNamesFromElement(element)
    console.log(`Found controller names:`, controllerNames)

    for (const controllerName of controllerNames) {
      const controller = findControllerForElement(element, controllerName, stimulus)
      console.log(`Controller ${controllerName}:`, controller)

      if (controller && typeof controller[method] === 'function') {
        try {
          console.log(`Calling ${method} on controller ${controllerName} with args:`, args)
          controller[method](...args)
          controllerFound = true
          console.log(`Successfully called ${method} on controller ${controllerName}`)
          break
        } catch (error) {
          console.error(`Error calling method ${method} on controller ${controllerName}:`, error)
        }
      }
    }

    // Strategy 2: If not found, try to find any controller on the element or its parents
    if (!controllerFound) {
      console.log(`No controller found with method ${method}, trying parent elements`)
      const controller = findAnyControllerWithMethod(element, method, stimulus)
      if (controller) {
        try {
          console.log(
            `Found controller with method ${method} on parent element, calling with args:`,
            args
          )
          controller[method](...args)
          controllerFound = true
          console.log(`Successfully called ${method} on parent controller`)
        } catch (error) {
          console.error(`Error calling method ${method} on found controller:`, error)
        }
      }
    }

    if (!controllerFound) {
      console.warn(`Method ${method} not found on any controller for element:`, element)
    }
  } catch (error) {
    console.error('Error invoking controller method:', error)
  }
}

/**
 * Processes a Turbo Stream invoke action by finding the target element,
 * locating its Stimulus controller, and calling the specified method.
 */
function processInvokeAction(element: Element): void {
  try {
    const action = element.getAttribute('action')
    const target = element.getAttribute('target')
    const method = element.getAttribute('method')
    const argsString = element.getAttribute('args')

    if (action !== 'invoke' || !target || !method) {
      console.warn('Invalid invoke action attributes:', { action, target, method })
      return
    }

    // Parse arguments safely
    let args: any[] = []
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
      processElementInvoke(targetElement, method, args)
    })
  } catch (error) {
    console.error('Error processing invoke action:', error)
  }
}

/**
 * Main event listener for Turbo Stream render events
 */
function handleTurboStreamRender(event: Event): void {
  try {
    const target = event.target as Element
    if (!target) return

    // Look for invoke actions in the rendered content
    const invokeElements = target.querySelectorAll('turbo-stream[action="invoke"]')

    invokeElements.forEach((element) => {
      processInvokeAction(element)
    })

    // Also check if the target itself is an invoke action
    if (target.matches && target.matches('turbo-stream[action="invoke"]')) {
      processInvokeAction(target)
    }
  } catch (error) {
    console.error('Error handling Turbo Stream render:', error)
  }
}

/**
 * Alternative event handler that processes the document for invoke actions
 */
function handleDocumentMutation(): void {
  try {
    // Look for any invoke actions that might have been added
    const invokeElements = document.querySelectorAll('turbo-stream[action="invoke"]')

    invokeElements.forEach((element) => {
      // Check if this element has already been processed
      if (!element.hasAttribute('data-invoke-processed')) {
        element.setAttribute('data-invoke-processed', 'true')
        processInvokeAction(element)
      }
    })
  } catch (error) {
    console.error('Error in document mutation handler:', error)
  }
}

/**
 * Initialize the invoke action handler
 */
export function initializeTurboInvokeHandler(): void {
  try {
    // Listen for turbo:before-stream-render to catch invoke actions
    document.addEventListener('turbo:before-stream-render', handleTurboStreamRender)

    // Also listen for turbo:render as a fallback
    document.addEventListener('turbo:render', handleTurboStreamRender)

    // Set up a mutation observer as an additional fallback
    const observer = new MutationObserver(() => {
      handleDocumentMutation()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    console.log('Turbo Stream invoke action handler initialized')
  } catch (error) {
    console.error('Error initializing Turbo invoke handler:', error)
  }
}

/**
 * Cleanup function to remove event listeners
 */
export function cleanupTurboInvokeHandler(): void {
  document.removeEventListener('turbo:before-stream-render', handleTurboStreamRender)
  document.removeEventListener('turbo:render', handleTurboStreamRender)
}
