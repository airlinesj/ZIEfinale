import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface ValidationRule {
  pattern: RegExp;
  errorMessage: string;
  hint: string;
}

export interface CountryValidation {
  idFormats: ValidationRule[];
  phoneFormat: ValidationRule;
  country: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentValidationService {
  
  private countryValidationRules: { [key: string]: CountryValidation } = {
    'Zimbabwe': {
      country: 'Zimbabwe',
      idFormats: [
        {
          pattern: /^\d{9}[A-Z]{1}$/i,
          errorMessage: 'Invalid National ID format',
          hint: 'Zimbabwe ID: 9 digits followed by 1 letter (e.g., 123456789A)'
        },
        {
          pattern: /^[A-Z]{2}\d{6,7}$/i,
          errorMessage: 'Invalid Passport format',
          hint: 'Zimbabwe Passport: 2 letters followed by 6-7 digits (e.g., ZW123456)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?263|0)[0-9]{9}$/,
        errorMessage: 'Invalid phone format for Zimbabwe',
        hint: 'Zimbabwe Phone: +263 or 0 followed by 9 digits (e.g., 0712345678 or +263712345678)'
      }
    },
    'South Africa': {
      country: 'South Africa',
      idFormats: [
        {
          pattern: /^\d{13}$/,
          errorMessage: 'Invalid South African ID format',
          hint: 'South Africa ID: 13 digits (e.g., 9301015800081)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?27|0)[0-9]{9}$/,
        errorMessage: 'Invalid phone format for South Africa',
        hint: 'South Africa Phone: +27 or 0 followed by 9 digits (e.g., 0712345678)'
      }
    },
    'Botswana': {
      country: 'Botswana',
      idFormats: [
        {
          pattern: /^\d{9}$/,
          errorMessage: 'Invalid Botswana ID format',
          hint: 'Botswana ID: 9 digits (e.g., 123456789)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?267)[0-9]{7,8}$/,
        errorMessage: 'Invalid phone format for Botswana',
        hint: 'Botswana Phone: +267 followed by 7-8 digits (e.g., +2671234567)'
      }
    },
    'Zambia': {
      country: 'Zambia',
      idFormats: [
        {
          pattern: /^\d{9,10}[A-Z]{1}$/i,
          errorMessage: 'Invalid Zambia ID format',
          hint: 'Zambia ID: 9-10 digits followed by 1 letter (e.g., 1234567890A)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?260)[0-9]{9}$/,
        errorMessage: 'Invalid phone format for Zambia',
        hint: 'Zambia Phone: +260 followed by 9 digits (e.g., +260969123456)'
      }
    },
    'Mozambique': {
      country: 'Mozambique',
      idFormats: [
        {
          pattern: /^\d{7}[A-Z]{1}\d{2}$/i,
          errorMessage: 'Invalid Mozambique ID format',
          hint: 'Mozambique ID: 7 digits, 1 letter, 2 digits (e.g., 1234567A89)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?258)[0-9]{8,9}$/,
        errorMessage: 'Invalid phone format for Mozambique',
        hint: 'Mozambique Phone: +258 followed by 8-9 digits (e.g., +258821234567)'
      }
    },
    'Malawi': {
      country: 'Malawi',
      idFormats: [
        {
          pattern: /^\d{1}\d{2}\d{7}\d{3}[A-Z]{1}[0-9]{3}[A-Z]{1}$/i,
          errorMessage: 'Invalid Malawi National ID format',
          hint: 'Malawi ID: National ID format (e.g., 1234567890)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?265)[0-9]{8,9}$/,
        errorMessage: 'Invalid phone format for Malawi',
        hint: 'Malawi Phone: +265 followed by 8-9 digits (e.g., +265991234567)'
      }
    },
    'Tanzania': {
      country: 'Tanzania',
      idFormats: [
        {
          pattern: /^\d{6}[A-Z]{1}\d{6}[A-Z]{2}$/i,
          errorMessage: 'Invalid Tanzania ID format',
          hint: 'Tanzania ID: Complex format (6 digits, letter, 6 digits, 2 letters)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?255)[0-9]{9}$/,
        errorMessage: 'Invalid phone format for Tanzania',
        hint: 'Tanzania Phone: +255 followed by 9 digits (e.g., +255658123456)'
      }
    },
    'Kenya': {
      country: 'Kenya',
      idFormats: [
        {
          pattern: /^[0-9]{1}\d{7}[A-Z]{1}\d{2}$/i,
          errorMessage: 'Invalid Kenya National ID format',
          hint: 'Kenya ID: Starts with digit, 7 digits, letter, 2 digits (e.g., 12345678A12)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?254)[0-9]{9}$/,
        errorMessage: 'Invalid phone format for Kenya',
        hint: 'Kenya Phone: +254 followed by 9 digits (e.g., +254712123456)'
      }
    },
    'UAE': {
      country: 'UAE',
      idFormats: [
        {
          pattern: /^\d{15}$/,
          errorMessage: 'Invalid UAE ID format',
          hint: 'UAE ID: 15 digits (emirate ID number)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?971)[0-9]{8,9}$/,
        errorMessage: 'Invalid phone format for UAE',
        hint: 'UAE Phone: +971 followed by 8-9 digits (e.g., +971501234567)'
      }
    },
    'Saudi Arabia': {
      country: 'Saudi Arabia',
      idFormats: [
        {
          pattern: /^\d{10}$/,
          errorMessage: 'Invalid Saudi national ID format',
          hint: 'Saudi ID: 10 digits (e.g., 1234567890)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?966)[0-9]{8,9}$/,
        errorMessage: 'Invalid phone format for Saudi Arabia',
        hint: 'Saudi Phone: +966 followed by 8-9 digits (e.g., +966501234567)'
      }
    }
  };

  constructor() { }

  /**
   * Get validation rules for a specific country
   */
  getCountryValidation(country: string): CountryValidation | null {
    return this.countryValidationRules[country] || null;
  }

  /**
   * Validate national ID based on country
   */
  validateNationalId(idNumber: string, country: string): { valid: boolean; error?: string; hint?: string } {
    const validation = this.getCountryValidation(country);
    
    if (!validation) {
      return { valid: true }; // No validation rules for this country
    }

    if (!idNumber || idNumber.trim() === '') {
      return { valid: false, error: 'ID number is required' };
    }

    // Check against all accepted formats
    for (const format of validation.idFormats) {
      if (format.pattern.test(idNumber)) {
        return { valid: true };
      }
    }

    // If no format matches, return error with hint
    return {
      valid: false,
      error: validation.idFormats[0].errorMessage,
      hint: validation.idFormats[0].hint
    };
  }

  /**
   * Validate phone number based on country
   */
  validatePhoneNumber(phoneNumber: string, country: string): { valid: boolean; error?: string; hint?: string } {
    const validation = this.getCountryValidation(country);
    
    if (!validation) {
      return { valid: true }; // No validation rules for this country
    }

    if (!phoneNumber || phoneNumber.trim() === '') {
      return { valid: false, error: 'Phone number is required' };
    }

    const cleanPhone = String(phoneNumber).trim();
    
    if (validation.phoneFormat.pattern.test(cleanPhone)) {
      return { valid: true };
    }

    return {
      valid: false,
      error: validation.phoneFormat.errorMessage,
      hint: validation.phoneFormat.hint
    };
  }

  /**
   * Create a validator function for national ID based on country
   */
  nationalIdValidator(countryControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Don't validate empty values
      }

      const country = countryControl?.value;
      if (!country) {
        return null;
      }

      const result = this.validateNationalId(control.value, country);
      
      if (!result.valid) {
        return { invalidNationalId: { message: result.error, hint: result.hint } };
      }
      
      return null;
    };
  }

  /**
   * Create a validator function for phone number based on country
   */
  phoneValidator(countryControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Don't validate empty values
      }

      const country = countryControl?.value;
      if (!country) {
        return null;
      }

      const result = this.validatePhoneNumber(control.value, country);
      
      if (!result.valid) {
        return { invalidPhone: { message: result.error, hint: result.hint } };
      }
      
      return null;
    };
  }

  /**
   * Get all supported countries
   */
  getSupportedCountries(): string[] {
    return Object.keys(this.countryValidationRules);
  }

  /**
   * Get hint text for a country's ID format
   */
  getIdFormatHint(country: string): string {
    const validation = this.getCountryValidation(country);
    if (!validation || validation.idFormats.length === 0) {
      return '';
    }
    return validation.idFormats.map(f => f.hint).join(' or ');
  }

  /**
   * Get hint text for a country's phone format
   */
  getPhoneFormatHint(country: string): string {
    const validation = this.getCountryValidation(country);
    return validation?.phoneFormat.hint || '';
  }
}
