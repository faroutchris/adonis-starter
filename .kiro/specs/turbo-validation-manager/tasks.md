# Implementation Plan

- [x] 1. Create TypeScript types and interfaces
  - Create `providers/turbo/validation/types.ts` with all ValidationManager type definitions
  - Define ValidationError, ValidationManagerConfig, and HttpContext extension interfaces
  - Export field mapping and error transformation function types
  - _Requirements: 6.1, 6.2, 6.4_

- [x] 2. Implement ErrorExtractor class
  - Create `providers/turbo/validation/error_extractor.ts` with VineJS error extraction logic
  - Move existing error extraction methods from exception handler to ErrorExtractor class
  - Add support for different VineJS error formats and structures
  - Implement robust error parsing with fallback handling
  - _Requirements: 1.4, 5.2_

- [x] 3. Implement FieldMapper class
  - Create `providers/turbo/validation/field_mapper.ts` with field name mapping logic
  - Move existing field mapping methods from exception handler to FieldMapper class
  - Add support for nested fields, array fields, and custom mapping rules
  - Implement field name normalization and cleanup logic
  - _Requirements: 1.4, 5.2_

- [ ] 4. Create ValidationManager main class
  - Create `providers/turbo/validation/validation_manager.ts` with main ValidationManager class
  - Implement constructor with HttpContext, TurboStream, ErrorExtractor, and FieldMapper dependencies
  - Add main `handleValidationError()` method that orchestrates the entire validation flow
  - Implement utility methods: `isValidationError()`, `isTurboEnabled()`
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 5. Add fluent API methods to ValidationManager
  - Implement `addFieldError()` method for manual field error addition
  - Add `withCustomMapping()` method for custom field mapping functions
  - Implement `withErrorTransform()` method for error message transformation
  - Ensure methods return ValidationManager instance for method chaining
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Update TurboProvider to bind ValidationManager
  - Modify `providers/turbo/turbo_provider.ts` to register ValidationManager with HttpContext
  - Add HttpContext macro that creates ValidationManager instance with proper dependencies
  - Ensure ValidationManager has access to current request context automatically
  - Add proper TypeScript declarations for context property
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 7. Refactor exception handler to use ValidationManager
  - Update `app/exceptions/handler.ts` to use ValidationManager instead of inline logic
  - Replace complex validation error handling with simple ValidationManager method calls
  - Maintain all existing functionality and backward compatibility
  - Remove duplicated validation logic now handled by ValidationManager
  - _Requirements: 3.1, 3.2, 3.3, 7.1, 7.2, 7.4_

- [ ] 8. Add comprehensive error handling and fallbacks
  - Implement graceful error handling in ValidationManager for edge cases
  - Add fallback behavior for non-Turbo Stream requests
  - Ensure ValidationManager fails gracefully when dependencies are missing
  - Maintain existing flash message behavior for non-Turbo requests
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 9. Create package index and exports
  - Create `providers/turbo/validation/index.ts` with clean exports for all validation classes
  - Export ValidationManager, ErrorExtractor, FieldMapper, and all types
  - Structure exports for easy future extraction as standalone package
  - Add proper TypeScript module declarations
  - _Requirements: 5.1, 5.3, 5.4_

- [ ] 10. Test ValidationManager integration
  - Test ValidationManager with existing employee form validation scenarios
  - Verify that all existing server validation functionality works unchanged
  - Test fluent API methods and custom validation scenarios
  - Ensure proper error handling and fallback behavior
  - _Requirements: 7.1, 7.2, 7.3, 7.4_
