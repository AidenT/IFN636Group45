import { Country } from "../types/globalTypes";

export abstract class FinancialYearCalculator {
    public abstract getFinancialYear(date?: Date): {
        start: Date;
        end: Date;
        label: string;
    };
}

export class AustralianFinancialYearCalculator extends FinancialYearCalculator {
    public getFinancialYear(date: Date): {
        start: Date;
        end: Date;
        label: string;
    } {
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth();
        const currentDay = date.getDate();

        const ausFYStartDate = new Date(currentYear, 6, 1) // July 1st
        const financialYearStart = getFinancialYearStart(currentMonth, currentYear, currentDay, ausFYStartDate);
        const financialYearEnd = new Date(financialYearStart.getFullYear() + 1, 5, 30, 23, 59, 59); // June 30th the year following the FY start

        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${financialYearStart.getFullYear()}-${financialYearEnd.getFullYear()}`
        };
    }
}

export class USFinancialYearCalculator extends FinancialYearCalculator {
    public getFinancialYear(date: Date): {
        start: Date;
        end: Date;
        label: string;
    } {
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth();
        const currentDay = date.getDate();

        const usFYStartDate = new Date(currentYear, 9, 1) // October 1st
        const financialYearStart = getFinancialYearStart(currentMonth, currentYear, currentDay, usFYStartDate);
        const financialYearEnd = new Date(financialYearStart.getFullYear() + 1, 8, 30, 23, 59, 59); // September 30th the year following the FY start

        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${financialYearStart.getFullYear()}-${financialYearEnd.getFullYear()}`
        };
    }
}

export class UKFinancialYearCalculator extends FinancialYearCalculator {
    public getFinancialYear(date: Date): {
        start: Date;
        end: Date;
        label: string;
    } {
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth();
        const currentDay = date.getDate();

        const ukFYStartDate = new Date(currentYear, 3, 6); // April 6th
        const financialYearStart = getFinancialYearStart(currentMonth, currentYear, currentDay, ukFYStartDate);
        const financialYearEnd = new Date(financialYearStart.getFullYear() + 1, 3, 5, 23, 59, 59); // April 5th the year following the FY start

        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${financialYearStart.getFullYear()}-${financialYearEnd.getFullYear()}`
        };
    }
}

export class CanadianFinancialYearCalculator extends FinancialYearCalculator {
    public getFinancialYear(date: Date): {
        start: Date;
        end: Date;
        label: string;
    } {
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth();
        const currentDay = date.getDate();

        const caFYStartDate = new Date(currentYear, 3, 1); // April 1st
        const financialYearStart = getFinancialYearStart(currentMonth, currentYear, currentDay, caFYStartDate);
        const financialYearEnd = new Date(financialYearStart.getFullYear() + 1, 2, 31, 23, 59, 59); // March 31st the year following the FY start

        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${financialYearStart.getFullYear()}-${financialYearEnd.getFullYear()}`
        };
    }
}

export class CalendarYearCalculator extends FinancialYearCalculator {
    public getFinancialYear(date: Date = new Date()): {
        start: Date;
        end: Date;
        label: string;
    } {
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth();
        const currentDay = date.getDate();

        const calStartDate = new Date(currentYear, 0, 1) // Jan 1st
        const financialYearStart = getFinancialYearStart(currentMonth, currentYear, currentDay, calStartDate);
        const financialYearEnd = new Date(financialYearStart.getFullYear(), 11, 31, 23, 59, 59); // December 31st same year.

        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${financialYearStart.getFullYear()}-${financialYearEnd.getFullYear()}`
        };
    }
}


function getFinancialYearStart(currentMonth: number, currentYear: number, currentDay: number, financialYearStart: Date): Date {
    const fyStartMonth = financialYearStart.getMonth();
    const fyStartDay = financialYearStart.getDate();

    if (currentMonth < fyStartMonth) {
        // Before the start month - use last year
        financialYearStart = new Date(currentYear - 1, fyStartMonth, fyStartDay);
    } else if (currentMonth > fyStartMonth) {
        // After the start month - use current year
        financialYearStart = new Date(currentYear, fyStartMonth, fyStartDay);
    } else {
        // Same month - check the day
        if (currentDay < fyStartDay) {
            financialYearStart = new Date(currentYear - 1, fyStartMonth, fyStartDay);
        } else {
            financialYearStart = new Date(currentYear, fyStartMonth, fyStartDay);
        }
    }

    return financialYearStart;
}

export class FinancialYearCalculatorFactory {
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
