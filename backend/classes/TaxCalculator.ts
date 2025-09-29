import { Country } from "../types/globalTypes";

interface TaxBracket {
    maxIncome: number;
    taxRate: number;
}

export abstract class TaxCalculator {
    protected abstract getTaxBrackets(): TaxBracket[]

    protected getTaxRateForIncome(grossIncome: number): number {
        const taxBrackets = this.getTaxBrackets();
        const interator = new TaxBracketIterator(taxBrackets);
        let taxPercentage = 0;

        while (interator.hasNext()) {
            const bracket = interator.next();
            if (bracket && grossIncome <= bracket.maxIncome) {
                taxPercentage = bracket.taxRate;
                break;
            }
        }

        return taxPercentage;
    }

    public calculateIncomeTax(payment: number, grossIncome: number): number {
        const taxPercentage = this.getTaxRateForIncome(grossIncome);
        return payment * taxPercentage;
    }

    public abstract calculateExpenseTax(expense: number): number
}

export class USTaxCalculator extends TaxCalculator {
    protected getTaxBrackets(): TaxBracket[] {
        return [
            { maxIncome: 9875, taxRate: 0.10 },
            { maxIncome: 40125, taxRate: 0.12 },
            { maxIncome: 85525, taxRate: 0.22 },
            { maxIncome: Infinity, taxRate: 0.24 }
        ];
    }

    public calculateExpenseTax(expense: number): number {
        return expense * 0.05; // US 5% tax on expenses
    }
}

export class AustralianTaxCalculator extends TaxCalculator {
    protected getTaxBrackets(): TaxBracket[] {
        return [
            { maxIncome: 18200, taxRate: 0.00 },
            { maxIncome: 45000, taxRate: 0.19 },
            { maxIncome: 120000, taxRate: 0.325 },
            { maxIncome: Infinity, taxRate: 0.37 }
        ];
    }

    public calculateExpenseTax(expense: number): number {
        return expense * 0.10; // 10% GST tax on all expenses
    }
}

export class TaxCalculatorFactory {
    public getTaxCalculator(country?: Country): TaxCalculator {
        switch (country) {
            case Country.Australia:
                return new AustralianTaxCalculator();
            case Country.UnitedStates:
                return new USTaxCalculator();
            default:
                return new AustralianTaxCalculator(); // Default to AustralianTaxCalculator
        }
    }
}

class TaxBracketIterator {
    private brackets: TaxBracket[];
    private currentIndex: number = 0;

    constructor(brackets: TaxBracket[]) {
        this.brackets = brackets;
    }

    hasNext(): boolean {
        return this.currentIndex < this.brackets.length;
    }

    next(): TaxBracket | null {
        if (this.hasNext()) {
            const currentBracket = this.brackets[this.currentIndex];
            this.currentIndex++;
            return currentBracket;
        }
        return null;
    }

    reset(): void {
        this.currentIndex = 0;
    }
}