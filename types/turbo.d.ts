declare module '@hotwired/turbo' {
  export interface StreamActions {
    [key: string]: () => void
  }

  export const StreamActions: StreamActions

  export function start(): void
  export function stop(): void
  export function visit(location: string, options?: any): void
  export function clearCache(): void
  export function setProgressBarDelay(delay: number): void
  export function setConfirmMethod(confirmMethod: (message: string) => boolean): void
  export function setFormMode(mode: string): void

  export interface TurboBeforeVisitEvent extends CustomEvent {
    detail: {
      url: string
    }
  }

  export interface TurboVisitEvent extends CustomEvent {
    detail: {
      url: string
      action: string
    }
  }

  export interface TurboLoadEvent extends CustomEvent {
    detail: {
      url: string
      timing: {
        visitStart: number
        requestStart: number
        requestEnd: number
        visitEnd: number
      }
    }
  }

  export interface TurboRenderEvent extends CustomEvent {
    detail: {
      newBody: HTMLElement
    }
  }

  export interface TurboFrameLoadEvent extends CustomEvent {
    detail: {
      fetchResponse: Response
    }
  }

  export interface TurboFrameRenderEvent extends CustomEvent {
    detail: {
      newFrame: HTMLElement
    }
  }

  export interface TurboStreamRenderEvent extends CustomEvent {
    detail: {
      newStream: HTMLElement
    }
  }
}
