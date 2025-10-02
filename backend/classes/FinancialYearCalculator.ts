import { Country } from "../types/globalTypes";

interface FinancialYear {
    start: Date;
    end: Date;
    label: string;
}

export abstract class FinancialYearCalculator {
    protected year: number;
    protected month: number;
    protected day: number;

    constructor(year: number, month: number, day: number) {
        this.year = year;
        this.month = month;
        this.day = day;
    }

    public abstract getFinancialYear(): FinancialYear;

    protected getFinancialYearStart(currentMonth: number, currentYear: number, currentDay: number, financialYearStart: Date): Date {
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
}

export class AustralianFinancialYearCalculator extends FinancialYearCalculator {
    constructor(year: number, month: number, day: number) {
        super(year, month, day);
    }
    
    public getFinancialYear(): FinancialYear {
        const ausFYStartDate = new Date(this.year, 6, 1) // July 1st
        const financialYearStart = this.getFinancialYearStart(this.month, this.year, this.day, ausFYStartDate);
        const financialYearEnd = new Date(financialYearStart.getFullYear() + 1, 5, 30, 23, 59, 59); // June 30th the year following the FY start

        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${financialYearStart.getFullYear()}-${financialYearEnd.getFullYear()}`
        };
    }
}

export class USFinancialYearCalculator extends FinancialYearCalculator {
    constructor(year: number, month: number, day: number) {
        super(year, month, day);
    }
    
    public getFinancialYear(): FinancialYear {
        const usFYStartDate = new Date(this.year, 9, 1) // October 1st
        const financialYearStart = this.getFinancialYearStart(this.month, this.year, this.day, usFYStartDate);
        const financialYearEnd = new Date(financialYearStart.getFullYear() + 1, 8, 30, 23, 59, 59); // September 30th the year following the FY start

        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${financialYearStart.getFullYear()}-${financialYearEnd.getFullYear()}`
        };
    }
}

export class UKFinancialYearCalculator extends FinancialYearCalculator {
    constructor(year: number, month: number, day: number) {
        super(year, month, day);
    }
    
    public getFinancialYear(): FinancialYear {
        const ukFYStartDate = new Date(this.year, 3, 6); // April 6th
        const financialYearStart = this.getFinancialYearStart(this.month, this.year, this.day, ukFYStartDate);
        const financialYearEnd = new Date(financialYearStart.getFullYear() + 1, 3, 5, 23, 59, 59); // April 5th the year following the FY start

        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${financialYearStart.getFullYear()}-${financialYearEnd.getFullYear()}`
        };
    }
}

export class CanadianFinancialYearCalculator extends FinancialYearCalculator {
    constructor(year: number, month: number, day: number) {
        super(year, month, day);
    }
    
    public getFinancialYear(): FinancialYear {
        const caFYStartDate = new Date(this.year, 3, 1); // April 1st
        const financialYearStart = this.getFinancialYearStart(this.month, this.year, this.day, caFYStartDate);
        const financialYearEnd = new Date(financialYearStart.getFullYear() + 1, 2, 31, 23, 59, 59); // March 31st the year following the FY start

        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${financialYearStart.getFullYear()}-${financialYearEnd.getFullYear()}`
        };
    }
}

export class CalendarYearCalculator extends FinancialYearCalculator {
    constructor(year: number, month: number, day: number) {
        super(year, month, day);
    }
    
    public getFinancialYear(): FinancialYear {
        const calStartDate = new Date(this.year, 0, 1) // Jan 1st
        const financialYearStart = this.getFinancialYearStart(this.month, this.year, this.day, calStartDate);
        const financialYearEnd = new Date(financialYearStart.getFullYear(), 11, 31, 23, 59, 59); // December 31st same year.

        return {
            start: financialYearStart,
            end: financialYearEnd,
            label: `FY${financialYearStart.getFullYear()}-${financialYearEnd.getFullYear()}`
        };
    }
}

export class FinancialYearCalculatorFactory {
    public static getCalculator(date: Date, country?: Country): FinancialYearCalculator {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        switch (country) {
            case Country.Australia:
                return new AustralianFinancialYearCalculator(year, month, day);
            case Country.UnitedStates:
                return new USFinancialYearCalculator(year, month, day);
            case Country.UnitedKingdom:
                return new UKFinancialYearCalculator(year, month, day);
            case Country.Canada:
                return new CanadianFinancialYearCalculator(year, month, day);
            default:
                return new CalendarYearCalculator(year, month, day);
        }
    }
}
