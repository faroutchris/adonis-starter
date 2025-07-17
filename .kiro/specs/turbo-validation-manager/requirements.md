# Requirements Document

## Introduction

This feature will refactor the existing server validation integration into a clean, structured package within the Turbo provider. The goal is to create a reusable `ValidationManager` that encapsulates all server validation logic, making it easy to use with simple one-liners in controllers and exception handlers, and preparing the code for potential publication as a standalone package.

## Requirements

### Requirement 1

**User Story:** As a developer, I want a clean ValidationManager class that handles all server validation logic, so that I can integrate server validation with simple method calls without cluttering my exception handler.

#### Acceptance Criteria

1. WHEN using server validation THEN there SHALL be a `ValidationManager` class within the Turbo provider
2. WHEN the ValidationManager is instantiated THEN it SHALL have access to the HttpContext and TurboStream instance
3. WHEN validation errors occur THEN the ValidationManager SHALL provide a single method to handle the entire validation error response
4. WHEN using the ValidationManager THEN it SHALL encapsulate all validation error detection, field mapping, and Turbo Stream generation logic

### Requirement 2

**User Story:** As a developer, I want the ValidationManager to be automatically available in my HttpContext, so that I can access it easily without manual instantiation.

#### Acceptance Criteria

1. WHEN the Turbo provider is registered THEN the ValidationManager SHALL be bound to the HttpContext
2. WHEN accessing the ValidationManager THEN it SHALL be available as `ctx.validationManager` or similar property
3. WHEN the ValidationManager is accessed THEN it SHALL be properly typed for TypeScript support
4. WHEN using the ValidationManager THEN it SHALL have access to the current request context automatically

### Requirement 3

**User Story:** As a developer, I want simple one-liner methods in my exception handler, so that handling validation errors is clean and maintainable.

#### Acceptance Criteria

1. WHEN a validation error occurs THEN the exception handler SHALL use a single method call like `ctx.validationManager.handleValidationError(error)`
2. WHEN calling the validation error handler THEN it SHALL return a ready-to-send response
3. WHEN using the ValidationManager THEN it SHALL handle all the complexity of error detection, field mapping, and response generation internally
4. WHEN the validation error is handled THEN it SHALL maintain all existing functionality without breaking changes

### Requirement 4

**User Story:** As a developer, I want the ValidationManager to provide utility methods for common validation scenarios, so that I can handle custom validation cases easily.

#### Acceptance Criteria

1. WHEN using the ValidationManager THEN there SHALL be a method to check if an error is a validation error
2. WHEN using the ValidationManager THEN there SHALL be a method to check if the request supports Turbo Streams
3. WHEN using the ValidationManager THEN there SHALL be a method to manually trigger validation errors for specific fields
4. WHEN using utility methods THEN they SHALL be chainable where appropriate for fluent API usage

### Requirement 5

**User Story:** As a developer, I want the ValidationManager to be structured as a clean, publishable package, so that it can be easily extracted and shared with the community.

#### Acceptance Criteria

1. WHEN implementing the ValidationManager THEN it SHALL be organized in a clear directory structure within the Turbo provider
2. WHEN the ValidationManager is implemented THEN it SHALL have minimal dependencies on the host application
3. WHEN the ValidationManager is structured THEN it SHALL follow TypeScript best practices for package development
4. WHEN the ValidationManager is complete THEN it SHALL be easy to extract into a standalone npm package

### Requirement 6

**User Story:** As a developer, I want comprehensive TypeScript types for the ValidationManager, so that I have full IDE support and type safety.

#### Acceptance Criteria

1. WHEN using the ValidationManager THEN all methods SHALL have proper TypeScript type definitions
2. WHEN the ValidationManager is used THEN it SHALL provide IntelliSense support in IDEs
3. WHEN extending the HttpContext THEN the ValidationManager SHALL be properly typed as a context property
4. WHEN validation errors are processed THEN the error types SHALL be properly defined and exported

### Requirement 7

**User Story:** As a developer, I want the ValidationManager to maintain backward compatibility, so that existing implementations continue to work without changes.

#### Acceptance Criteria

1. WHEN the ValidationManager is implemented THEN all existing server validation functionality SHALL continue to work
2. WHEN the refactoring is complete THEN no breaking changes SHALL be introduced to the public API
3. WHEN the ValidationManager is used THEN it SHALL support all existing validation error formats and field mapping logic
4. WHEN migrating to the ValidationManager THEN existing exception handler code SHALL work with minimal changes
