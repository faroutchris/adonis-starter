# Implementation Plan

- [x] 1. Add serverError method to InputValidationController
  - Extend the existing `InputValidationController` class with a `serverError(fieldName: string, message: string)` method
  - Implement logic to find input element by field name, mark as dirty and invalid, display error message
  - Reuse existing validation UI logic for consistent styling and behavior
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3_

- [x] 2. Add invoke method to TurboStream class
  - Extend `TurboStream` class in `providers/turbo/turbo_stream.ts` with `invoke(target: string, method: string, args: any[])` method
  - Create new `TurboTemplate` with invoke directive structure
  - Add invoke action support to template rendering logic
  - _Requirements: 5.1, 5.2_

- [x] 3. Implement client-side invoke action handler
  - Create event listener to process custom Turbo Stream invoke actions
  - Add logic to find Stimulus controller instances and call specified methods with arguments
  - Implement safe error handling for missing controllers or methods
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. Enhance exception handler for validation errors
  - Modify `HttpExceptionHandler` in `app/exceptions/handler.ts` to detect VineJS validation errors
  - Add method to check if request is Turbo Stream request
  - Implement validation error to Turbo Stream response conversion
  - Create field name to input ID mapping logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Create validation error response helper
  - Implement `createValidationTurboStream()` method in exception handler
  - Generate invoke actions for each validation error targeting specific form inputs
  - Map validation field names to form input element IDs
  - Handle nested field names and array field names appropriately
  - _Requirements: 2.3, 2.4_

- [x] 6. Test server validation integration with employee form
  - Modify `EmployeesController` store method to test server validation error handling
  - Add a test validation rule that can fail server-side (e.g., duplicate name check)
  - Verify that validation errors are displayed using client-side validation UI
  - Test that subsequent client-side validation works after server errors
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2_

- [x] 7. Add error state management integration
  - Ensure server errors mark inputs as dirty for subsequent client-side validation
  - Implement logic to clear server errors when client-side validation passes
  - Test mixed validation scenarios with both client and server errors
  - Verify error state transitions work correctly
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 8. Add fallback handling for non-Turbo requests
  - Ensure existing error handling continues to work for non-Turbo Stream requests
  - Maintain backward compatibility with flash message error display
  - Test that forms without client-side validation still receive server errors appropriately
  - _Requirements: 2.1, 2.2_
