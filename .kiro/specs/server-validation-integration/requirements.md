# Requirements Document

## Introduction

This feature will integrate server-side validation errors with the existing client-side validation system to provide a seamless user experience. When server-side validation fails (e.g., email already exists), the errors will be displayed using the same UI patterns as client-side validation, maintaining consistency and avoiding page reloads.

## Requirements

### Requirement 1

**User Story:** As a user filling out a form, I want server-side validation errors to appear in the same way as client-side validation errors, so that I have a consistent experience regardless of where the validation occurs.

#### Acceptance Criteria

1. WHEN a form is submitted AND server-side validation fails THEN the form SHALL display validation errors without a page reload
2. WHEN server-side validation errors are displayed THEN they SHALL use the same visual styling as client-side validation errors
3. WHEN a server-side validation error is shown THEN the corresponding input field SHALL be marked as invalid with the same CSS classes used for client-side validation
4. WHEN server-side validation errors are displayed THEN they SHALL appear in the same feedback elements used for client-side validation

### Requirement 2

**User Story:** As a developer, I want to handle server-side validation errors in the exception handler, so that I can provide consistent error responses across all forms in the application.

#### Acceptance Criteria

1. WHEN a validation exception occurs in any controller THEN the exception handler SHALL detect if the request is a Turbo Stream request
2. WHEN a validation exception occurs AND the request is a Turbo Stream request THEN the system SHALL return Turbo Stream responses instead of redirects
3. WHEN validation errors are returned via Turbo Stream THEN they SHALL target specific form inputs using the invoke action
4. WHEN validation errors are processed THEN they SHALL be formatted to match the client-side validation error structure

### Requirement 3

**User Story:** As a user, I want server-side validation errors to integrate with the existing client-side validation state, so that subsequent client-side validation works correctly after server errors are displayed.

#### Acceptance Criteria

1. WHEN a server-side validation error is displayed THEN the input SHALL be marked as "dirty" to enable client-side validation on subsequent changes
2. WHEN a user corrects a server-side validation error THEN client-side validation SHALL take over and clear the error when the input becomes valid
3. WHEN server-side validation errors are shown THEN they SHALL not interfere with existing client-side validation rules
4. WHEN a form has both client-side and server-side validation errors THEN both types SHALL be handled consistently

### Requirement 4

**User Story:** As a developer, I want a reusable method to trigger server-side validation errors on form inputs, so that I can easily integrate this functionality across different forms.

#### Acceptance Criteria

1. WHEN implementing server validation error display THEN there SHALL be a `serverError()` method in the InputValidationController
2. WHEN the `serverError()` method is called THEN it SHALL accept an error message and field name as parameters
3. WHEN the `serverError()` method is executed THEN it SHALL display the error using the same logic as client-side validation
4. WHEN server errors are set THEN they SHALL persist until the user interacts with the field or the form is resubmitted

### Requirement 5

**User Story:** As a developer, I want the Turbo Stream system to support invoking controller methods with parameters, so that I can pass validation error data to the client-side validation controller.

#### Acceptance Criteria

1. WHEN using Turbo Streams THEN there SHALL be support for an "invoke" action that can call Stimulus controller methods
2. WHEN using the invoke action THEN it SHALL support passing arguments to the invoked method
3. WHEN the invoke action is processed THEN it SHALL target specific DOM elements with Stimulus controllers
4. WHEN method invocation fails THEN it SHALL fail gracefully without breaking the form functionality