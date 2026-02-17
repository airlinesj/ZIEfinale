# Document Validation Service - Usage Guide

## Overview

The `DocumentValidationService` provides country-specific validation for national ID numbers and phone numbers. This ensures users enter data in the correct format for their country before form submission.

## Supported Countries

The service currently supports validation rules for the following countries:

- **Zimbabwe**: National ID (9 digits + 1 letter) or Passport (2 letters + 6-7 digits), Phone (+263 or 0 + 9 digits)
- **South Africa**: ID (13 digits), Phone (+27 or 0 + 9 digits)
- **Botswana**: ID (9 digits), Phone (+267 + 7-8 digits)
- **Zambia**: ID (9-10 digits + 1 letter), Phone (+260 + 9 digits)
- **Mozambique**: ID (7 digits + 1 letter + 2 digits), Phone (+258 + 8-9 digits)
- **Malawi**: ID (complex format), Phone (+265 + 8-9 digits)
- **Tanzania**: ID (complex format), Phone (+255 + 9 digits)
- **Kenya**: ID (digit + 7 digits + letter + 2 digits), Phone (+254 + 9 digits)
- **UAE**: ID (15 digits), Phone (+971 + 8-9 digits)
- **Saudi Arabia**: ID (10 digits), Phone (+966 + 8-9 digits)

## How to Use in Components

### 1. Import the Service

```typescript
import { DocumentValidationService } from '../services/document-validation.service';

constructor(
  private docValidationService: DocumentValidationService
) {}
```

### 2. Validate Single Values

```typescript
// Validate National ID
const idResult = this.docValidationService.validateNationalId('123456789A', 'Zimbabwe');
if (idResult.valid) {
  console.log('Valid ID');
} else {
  console.log('Error:', idResult.error);
  console.log('Hint:', idResult.hint);
}

// Validate Phone Number
const phoneResult = this.docValidationService.validatePhoneNumber('+263712345678', 'Zimbabwe');
if (phoneResult.valid) {
  console.log('Valid phone');
} else {
  console.log('Error:', phoneResult.error);
}
```

### 3. Apply to Form Controls

```typescript
// Update phone validator based on country
const phoneControl = this.form.get('phone');
phoneControl?.setValidators([
  Validators.required,
  (control) => {
    const result = this.docValidationService.validatePhoneNumber(control.value, this.selectedCountry);
    if (!result.valid) {
      return { invalidPhone: result.error };
    }
    return null;
  }
]);
phoneControl?.updateValueAndValidity();
```

### 4. Get Format Hints

```typescript
// Show user the expected format
const idHint = this.docValidationService.getIdFormatHint('Zimbabwe');
const phoneHint = this.docValidationService.getPhoneFormatHint('Zimbabwe');
```

## Implementation in Form-M1

The service is already integrated into the M1 form component:

1. **Dynamic Validator Application**: When a user selects their nationality, appropriate validators are applied
2. **Server Validation**: The service uses the user's registered country to validate against correct formats
3. **User Feedback**: Error messages and hints guide users to enter data in the correct format

### Method: `applyCountrySpecificValidators(country: string)`

Automatically applies the correct phone and national ID validators for a given country.

```typescript
// Called when form data is loaded
this.applyCountrySpecificValidators('Zimbabwe');
```

## Example Validation Scenarios

### Zimbabwe

- ✅ National ID: `123456789A`
- ✅ Passport: `ZW123456`
- ✅ Phone: `+263712345678` or `0712345678`
- ❌ Phone: `712345678` (missing country code or leading 0)

### South Africa

- ✅ National ID: `9301015800081` (13 digits)
- ✅ Phone: `+27812345678` or `0812345678`
- ❌ National ID: `93010158` (too short)

## Error Messages

When validation fails, users receive:

1. **Error Message**: Specific error about why the input is invalid
2. **Hint**: User-friendly format example showing the correct pattern

## Adding New Countries

To add validation for a new country:

1. Open `document-validation.service.ts`
2. Add the country to the `countryValidationRules` object:

```typescript
'CountryName': {
  country: 'CountryName',
  idFormats: [
    {
      pattern: /YOUR_REGEX_PATTERN/i,
      errorMessage: 'Error description',
      hint: 'Format example: XXX123'
    }
  ],
  phoneFormat: {
    pattern: /YOUR_PHONE_PATTERN/,
    errorMessage: 'Invalid phone format',
    hint: 'Phone format: +XX9 digits'
  }
}
```

## Benefits

- ✅ Prevents invalid data from being submitted
- ✅ Real-time feedback as users type
- ✅ Consistent validation across the application
- ✅ Easy to extend with new countries
- ✅ Clear error messages and examples for users
- ✅ Supports multiple ID format options per country

## Form-M1 Integration Points

1. **Form Initialization**: Default validators applied
2. **Data Loading**: Country-specific validators applied when saved data is loaded
3. **Application Loading**: Validators applied when loading rejected applications for resubmission
4. **Nationality Change**: (Can be added) Validators update dynamically when user changes nationality

## Testing

To test the validators:

```typescript
const service = inject(DocumentValidationService);

// Test Zimbabwe ID
console.log(service.validateNationalId('123456789A', 'Zimbabwe')); // Should be valid
console.log(service.validateNationalId('123456', 'Zimbabwe')); // Should be invalid

// Test phone
console.log(service.validatePhoneNumber('+263712345678', 'Zimbabwe')); // Should be valid
console.log(service.validatePhoneNumber('123', 'Zimbabwe')); // Should be invalid
```
