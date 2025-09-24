import { Country } from "../types/globalTypes";

/**
 * Abstract base class for calculating financial year periods
 * Different countries have different financial year periods
 */
export abstract class FinancialYearCalculator {
    /**
     * Calculate the financial year period for a given date
     * @param date - The date to calculate the financial year for (defaults to current date)
     * @returns Object containing the start and end dates of the financial year
     */
    public abstract getFinancialYear(date?: Date): {
        start: Date;
        end: Date;
        label: string;
    };

    /**
     * Get the appropriate calculator for a given country
     * @param country - The country code or name
     * @returns The appropriate financial year calculator instance
     */
    public static getCalculator(country: Country): FinancialYearCalculator {

        switch (country) {
            case Country.Australia:
                return new AustralianFinancialYearCalculator();
            case Country.UnitedStates:
                return new USFinancialYearCalculator();
            case Country.UnitedKingdom:
                return new UKFinancialYearCalculator();
            case Country.Canada:
                return new CanadianFinancialYearCalculator();
            default:
                return new CalendarYearCalculator();
        }
    }
}

/**
 * Australian Financial Year Calculator
 * Financial year runs from July 1st to June 30th
 */
export class AustralianFinancialYearCalculator extends FinancialYearCalculator {
    public getFinancialYear(date: Date = new Date()): {
        start: Date;
        end: Date;
        label: string;
    } {
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth(); // 0-based (0 = January, 6 = July)
        
        // If we're in January-June, the financial year started last year and ends this year
        // If we're in July-December, the financial year started this year and ends next year
        const financialYearStart = currentMonth < 6 
            ? new Date(currentYear - 1, 6, 1) // July 1st of last year
            : new Date(currentYear, 6, 1);    // July 1st of this year
            
        const financialYearEnd = currentMonth < 6
            ? new Date(currentYear, 5, 30, 23, 59, 59)     // June 30th of THIS year
            : new Date(currentYear + 1, 5, 30, 23, 59, 59); // June 30th of NEXT year
        
        const startYear = financialYearStart.getFullYear();
        const endYear = financialYearEnd.getFullYear();
        
        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${startYear}-${endYear.toString().slice(-2)}`
        };
    }
}

/**
 * US Financial Year Calculator (Federal Government)
 * Financial year runs from October 1st to September 30th
 */
export class USFinancialYearCalculator extends FinancialYearCalculator {
    public getFinancialYear(date: Date = new Date()): {
        start: Date;
        end: Date;
        label: string;
    } {
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth(); // 0-based (0 = January, 9 = October)
        
        // If we're in January-September, the financial year started last year and ends this year
        // If we're in October-December, the financial year started this year and ends next year
        const financialYearStart = currentMonth < 9 
            ? new Date(currentYear - 1, 9, 1) // October 1st of last year
            : new Date(currentYear, 9, 1);    // October 1st of this year
            
        const financialYearEnd = currentMonth < 9
            ? new Date(currentYear, 8, 30, 23, 59, 59)     // September 30th of THIS year
            : new Date(currentYear + 1, 8, 30, 23, 59, 59); // September 30th of NEXT year
        
        const startYear = financialYearStart.getFullYear();
        const endYear = financialYearEnd.getFullYear();
        
        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${endYear}`
        };
    }
}

/**
 * UK Financial Year Calculator
 * Financial year runs from April 6th to April 5th
 */
export class UKFinancialYearCalculator extends FinancialYearCalculator {
    public getFinancialYear(date: Date = new Date()): {
        start: Date;
        end: Date;
        label: string;
    } {
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth(); // 0-based (0 = January, 3 = April)
        const currentDay = date.getDate();
        
        // If we're before April 6th, the financial year started last year and ends this year
        // If we're on or after April 6th, the financial year started this year and ends next year
        const beforeApril6 = currentMonth < 3 || (currentMonth === 3 && currentDay < 6);
        const financialYearStart = beforeApril6
            ? new Date(currentYear - 1, 3, 6) // April 6th of last year
            : new Date(currentYear, 3, 6);    // April 6th of this year
            
        const financialYearEnd = beforeApril6
            ? new Date(currentYear, 3, 5, 23, 59, 59)     // April 5th of THIS year
            : new Date(currentYear + 1, 3, 5, 23, 59, 59); // April 5th of NEXT year
        
        const startYear = financialYearStart.getFullYear();
        const endYear = financialYearEnd.getFullYear();
        
        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `${startYear}-${endYear.toString().slice(-2)}`
        };
    }
}

/**
 * Canadian Financial Year Calculator
 * Financial year runs from April 1st to March 31st
 */
export class CanadianFinancialYearCalculator extends FinancialYearCalculator {
    public getFinancialYear(date: Date = new Date()): {
        start: Date;
        end: Date;
        label: string;
    } {
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth(); // 0-based (0 = January, 3 = April)
        
        // If we're in January-March, the financial year started last year and ends this year
        // If we're in April-December, the financial year started this year and ends next year
        const financialYearStart = currentMonth < 3 
            ? new Date(currentYear - 1, 3, 1) // April 1st of last year
            : new Date(currentYear, 3, 1);    // April 1st of this year
            
        const financialYearEnd = currentMonth < 3
            ? new Date(currentYear, 2, 31, 23, 59, 59)     // March 31st of THIS year
            : new Date(currentYear + 1, 2, 31, 23, 59, 59); // March 31st of NEXT year
        
        const startYear = financialYearStart.getFullYear();
        const endYear = financialYearEnd.getFullYear();
        
        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${startYear}-${endYear.toString().slice(-2)}`
        };
    }
}

/**
 * Calendar Year Calculator (Default)
 * Financial year runs from January 1st to December 31st
 */
export class CalendarYearCalculator extends FinancialYearCalculator {
    public getFinancialYear(date: Date = new Date()): {
        start: Date;
        end: Date;
        label: string;
    } {
        const currentYear = date.getFullYear();
        
        const financialYearStart = new Date(currentYear, 0, 1); // January 1st
        const financialYearEnd = new Date(currentYear, 11, 31, 23, 59, 59); // December 31st
        
        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `CY${currentYear}`
        };
    }
}

/**
 * Factory class for creating financial year calculators
 */
export class FinancialYearCalculatorFactory {
    /**
     * Get the appropriate financial year calculator for a country
     * @param country - The country code or name
     * @returns The appropriate financial year calculator instance
     */
    public static getCalculator(country: Country): FinancialYearCalculator {
        return FinancialYearCalculator.getCalculator(country);
    }
}
