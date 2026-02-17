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
    // African Countries
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
        hint: 'Zimbabwe Phone: +263 or 0 followed by 9 digits (e.g., 0712345678)'
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
          pattern: /^\d{7,10}$/,
          errorMessage: 'Invalid Malawi ID format',
          hint: 'Malawi ID: 7-10 digits (e.g., 1234567)'
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
          pattern: /^\d{8,20}$/,
          errorMessage: 'Invalid Tanzania ID format',
          hint: 'Tanzania ID: 8-20 digits'
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
          pattern: /^\d{5,10}$/,
          errorMessage: 'Invalid Kenya National ID format',
          hint: 'Kenya ID: 5-10 digits (e.g., 12345678)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?254)[0-9]{9}$/,
        errorMessage: 'Invalid phone format for Kenya',
        hint: 'Kenya Phone: +254 followed by 9 digits (e.g., +254712123456)'
      }
    },
    'Uganda': {
      country: 'Uganda',
      idFormats: [
        {
          pattern: /^\d{5,14}$/,
          errorMessage: 'Invalid Uganda ID format',
          hint: 'Uganda ID: 5-14 digits'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?256)[0-9]{9}$/,
        errorMessage: 'Invalid phone format for Uganda',
        hint: 'Uganda Phone: +256 followed by 9 digits'
      }
    },
    'Ethiopia': {
      country: 'Ethiopia',
      idFormats: [
        {
          pattern: /^\d{7,9}$/,
          errorMessage: 'Invalid Ethiopia ID format',
          hint: 'Ethiopia ID: 7-9 digits'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?251)[0-9]{8,9}$/,
        errorMessage: 'Invalid phone format for Ethiopia',
        hint: 'Ethiopia Phone: +251 followed by 8-9 digits'
      }
    },
    'Nigeria': {
      country: 'Nigeria',
      idFormats: [
        {
          pattern: /^\d{11}$/,
          errorMessage: 'Invalid Nigeria ID format',
          hint: 'Nigeria ID: 11 digits (National ID)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?234)[0-9]{10}$/,
        errorMessage: 'Invalid phone format for Nigeria',
        hint: 'Nigeria Phone: +234 followed by 10 digits'
      }
    },
    'Ghana': {
      country: 'Ghana',
      idFormats: [
        {
          pattern: /^\d{10}[A-Z]{1}$/i,
          errorMessage: 'Invalid Ghana ID format',
          hint: 'Ghana ID: 10 digits followed by 1 letter'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?233)[0-9]{9}$/,
        errorMessage: 'Invalid phone format for Ghana',
        hint: 'Ghana Phone: +233 followed by 9 digits'
      }
    },
    'Cameroon': {
      country: 'Cameroon',
      idFormats: [
        {
          pattern: /^\d{9}$/,
          errorMessage: 'Invalid Cameroon ID format',
          hint: 'Cameroon ID: 9 digits'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?237)[0-9]{8,9}$/,
        errorMessage: 'Invalid phone format for Cameroon',
        hint: 'Cameroon Phone: +237 followed by 8-9 digits'
      }
    },
    'Rwanda': {
      country: 'Rwanda',
      idFormats: [
        {
          pattern: /^\d{1}[A-Z]{1}\d{6}$/i,
          errorMessage: 'Invalid Rwanda ID format',
          hint: 'Rwanda ID: Digit, Letter, 6 digits'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?250)[0-9]{8,9}$/,
        errorMessage: 'Invalid phone format for Rwanda',
        hint: 'Rwanda Phone: +250 followed by 8-9 digits'
      }
    },
    'Angola': {
      country: 'Angola',
      idFormats: [
        {
          pattern: /^\d{2}[A-Z]{1}\d{6}$/i,
          errorMessage: 'Invalid Angola ID format',
          hint: 'Angola BI: 2 digits, 1 letter, 6 digits'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?244)[0-9]{8,9}$/,
        errorMessage: 'Invalid phone format for Angola',
        hint: 'Angola Phone: +244 followed by 8-9 digits'
      }
    },
    'Namibia': {
      country: 'Namibia',
      idFormats: [
        {
          pattern: /^\d{8}[A-Z]{1}\d{2}$/i,
          errorMessage: 'Invalid Namibia ID format',
          hint: 'Namibia ID: 8 digits, 1 letter, 2 digits'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?264)[0-9]{8,9}$/,
        errorMessage: 'Invalid phone format for Namibia',
        hint: 'Namibia Phone: +264 followed by 8-9 digits'
      }
    },
    // Americas
    'USA': {
      country: 'USA',
      idFormats: [
        {
          pattern: /^\d{3}-\d{2}-\d{4}$/,
          errorMessage: 'Invalid US Social Security Number format',
          hint: 'US SSN: XXX-XX-XXXX (e.g., 123-45-6789)'
        },
        {
          pattern: /^[A-Z]{1}\d{5,8}$/i,
          errorMessage: 'Invalid US State ID format',
          hint: 'US License: Letter followed by 5-8 digits'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
        errorMessage: 'Invalid US phone format',
        hint: 'US Phone: (123) 456-7890 or 123-456-7890 or +1-123-456-7890'
      }
    },
    'Canada': {
      country: 'Canada',
      idFormats: [
        {
          pattern: /^\d{9}$/,
          errorMessage: 'Invalid Canadian Social Insurance Number',
          hint: 'Canadian SIN: 9 digits (e.g., 123456789)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
        errorMessage: 'Invalid Canadian phone format',
        hint: 'Canada Phone: (123) 456-7890 or +1-123-456-7890'
      }
    },
    // Europe
    'United Kingdom': {
      country: 'United Kingdom',
      idFormats: [
        {
          pattern: /^[A-Z]{2}\d{6}\s[A-Z]{3}$/i,
          errorMessage: 'Invalid UK National Insurance format',
          hint: 'UK NI: AB123456 XXX (e.g., AB123456 ABC)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?44|0)[0-9]{10}$/,
        errorMessage: 'Invalid UK phone format',
        hint: 'UK Phone: +44 or 0 followed by 10 digits'
      }
    },
    'Ireland': {
      country: 'Ireland',
      idFormats: [
        {
          pattern: /^\d{7}[A-Z]{1}[A-Z]{1}$/i,
          errorMessage: 'Invalid Irish PPS Number format',
          hint: 'Irish PPS: 7 digits followed by 2 letters (e.g., 1234567AA)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?353|0)[0-9]{9,10}$/,
        errorMessage: 'Invalid Irish phone format',
        hint: 'Ireland Phone: +353 or 0 followed by 9-10 digits'
      }
    },
    'Germany': {
      country: 'Germany',
      idFormats: [
        {
          pattern: /^\d{1,2}\s\d{6,7}\s[A-Z]{1}\s\d{10}$/i,
          errorMessage: 'Invalid German ID format',
          hint: 'German ID: Complex format'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?49|0)[0-9]{9,11}$/,
        errorMessage: 'Invalid German phone format',
        hint: 'Germany Phone: +49 or 0 followed by 9-11 digits'
      }
    },
    'France': {
      country: 'France',
      idFormats: [
        {
          pattern: /^\d{13}$/,
          errorMessage: 'Invalid French ID format',
          hint: 'France ID: 13 digits (INSEE)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?33|0)[0-9]{8,9}$/,
        errorMessage: 'Invalid French phone format',
        hint: 'France Phone: +33 or 0 followed by 8-9 digits'
      }
    },
    'Netherlands': {
      country: 'Netherlands',
      idFormats: [
        {
          pattern: /^[A-Z]{2}\d{6}$/i,
          errorMessage: 'Invalid Dutch ID format',
          hint: 'Netherlands ID: 2 letters followed by 6 digits'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?31|0)[0-9]{8,9}$/,
        errorMessage: 'Invalid Dutch phone format',
        hint: 'Netherlands Phone: +31 or 0 followed by 8-9 digits'
      }
    },
    'Belgium': {
      country: 'Belgium',
      idFormats: [
        {
          pattern: /^\d{11}$/,
          errorMessage: 'Invalid Belgian ID format',
          hint: 'Belgium ID: 11 digits'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?32|0)[0-9]{8,9}$/,
        errorMessage: 'Invalid Belgian phone format',
        hint: 'Belgium Phone: +32 or 0 followed by 8-9 digits'
      }
    },
    'Switzerland': {
      country: 'Switzerland',
      idFormats: [
        {
          pattern: /^\d{5}\.\d{4}\.\d{4}\.\d{2}$/,
          errorMessage: 'Invalid Swiss ID format',
          hint: 'Switzerland AHV: XXXXX.XXXX.XXXX.XX'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?41|0)[0-9]{8,9}$/,
        errorMessage: 'Invalid Swiss phone format',
        hint: 'Switzerland Phone: +41 or 0 followed by 8-9 digits'
      }
    },
    // Asia-Pacific
    'Australia': {
      country: 'Australia',
      idFormats: [
        {
          pattern: /^\d{8}$/,
          errorMessage: 'Invalid Australian ID format',
          hint: 'Australia ID: 8 digits (Medicare or Tax File Number)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?61|0)[0-9]{8,9}$/,
        errorMessage: 'Invalid Australian phone format',
        hint: 'Australia Phone: +61 or 0 followed by 8-9 digits'
      }
    },
    'New Zealand': {
      country: 'New Zealand',
      idFormats: [
        {
          pattern: /^\d{3}\s\d{3}\s\d{3}$/,
          errorMessage: 'Invalid NZ ID format',
          hint: 'New Zealand IRD: XXX XXX XXX (e.g., 123 456 789)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?64|0)[0-9]{8,9}$/,
        errorMessage: 'Invalid NZ phone format',
        hint: 'New Zealand Phone: +64 or 0 followed by 8-9 digits'
      }
    },
    'Singapore': {
      country: 'Singapore',
      idFormats: [
        {
          pattern: /^[STFG]\d{7}[A-Z]{1}$/i,
          errorMessage: 'Invalid Singapore NRIC format',
          hint: 'Singapore NRIC: Letter, 7 digits, letter (e.g., S1234567A)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?65)[0-9]{8}$/,
        errorMessage: 'Invalid Singapore phone format',
        hint: 'Singapore Phone: +65 followed by 8 digits'
      }
    },
    'Malaysia': {
      country: 'Malaysia',
      idFormats: [
        {
          pattern: /^\d{6}-\d{2}-\d{4}$/,
          errorMessage: 'Invalid Malaysian ID format',
          hint: 'Malaysia NRIC: XXXXXX-XX-XXXX (6 digits - 2 digits - 4 digits)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?60|0)[0-9]{9,10}$/,
        errorMessage: 'Invalid Malaysian phone format',
        hint: 'Malaysia Phone: +60 or 0 followed by 9-10 digits'
      }
    },
    'India': {
      country: 'India',
      idFormats: [
        {
          pattern: /^\d{12}$/,
          errorMessage: 'Invalid Indian ID format',
          hint: 'India Aadhaar: 12 digits (e.g., 123456789012)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?91|0)[0-9]{10}$/,
        errorMessage: 'Invalid Indian phone format',
        hint: 'India Phone: +91 or 0 followed by 10 digits'
      }
    },
    'China': {
      country: 'China',
      idFormats: [
        {
          pattern: /^\d{18}$/,
          errorMessage: 'Invalid Chinese ID format',
          hint: 'China ID: 18 digits'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?86|0)[0-9]{10,11}$/,
        errorMessage: 'Invalid Chinese phone format',
        hint: 'China Phone: +86 or 0 followed by 10-11 digits'
      }
    },
    'Japan': {
      country: 'Japan',
      idFormats: [
        {
          pattern: /^\d{4}-\d{4}-\d{4}$/,
          errorMessage: 'Invalid Japanese ID format',
          hint: 'Japan ID: XXXX-XXXX-XXXX (12 digits)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?81|0)[0-9]{9,10}$/,
        errorMessage: 'Invalid Japanese phone format',
        hint: 'Japan Phone: +81 or 0 followed by 9-10 digits'
      }
    },
    'South Korea': {
      country: 'South Korea',
      idFormats: [
        {
          pattern: /^\d{6}-\d{7}$/,
          errorMessage: 'Invalid South Korean ID format',
          hint: 'South Korea ID: XXXXXX-XXXXXXX (6 digits - 7 digits)'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?82|0)[0-9]{9,10}$/,
        errorMessage: 'Invalid South Korean phone format',
        hint: 'South Korea Phone: +82 or 0 followed by 9-10 digits'
      }
    },
    // Middle East
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
    },
    // Other
    'Other': {
      country: 'Other',
      idFormats: [
        {
          pattern: /^.{5,20}$/,
          errorMessage: 'Invalid ID format',
          hint: 'ID: 5-20 characters'
        }
      ],
      phoneFormat: {
        pattern: /^(\+?)[0-9]{6,15}$/,
        errorMessage: 'Invalid phone format',
        hint: 'Phone: Country code (optional) followed by 6-15 digits'
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
