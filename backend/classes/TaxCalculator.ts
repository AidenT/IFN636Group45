import { Country } from "../types/globalTypes";

interface TaxBracket {
    maxIncome: number;
    taxRate: number;
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

class TaxCalculator {
    protected static getTaxBrackets(): TaxBracket[] {
        return [
            { maxIncome: 9875, taxRate: 0.10 },
            { maxIncome: 40125, taxRate: 0.12 },
            { maxIncome: 85525, taxRate: 0.22 },
            { maxIncome: Infinity, taxRate: 0.24 }
        ];
    }

    protected static getTaxRateForIncome(grossIncome: number): number {
        const taxBrackets = this.getTaxBrackets();
        const interator = new TaxBracketIterator(taxBrackets);
        let taxPercentage = 0;
        
        while (interator.hasNext()){
            const bracket = interator.next();
            if(bracket && grossIncome <= bracket.maxIncome){
                taxPercentage = bracket.taxRate;
                break;
            }
        }
        
        return taxPercentage;
    }

    static calculateIncomeTax(payment: number, grossIncome: number): number {
        const taxPercentage = this.getTaxRateForIncome(grossIncome);
        return payment * taxPercentage;
    }

    static calculateExpenseTax(expense: number): number {
        return expense * 0.05; // Default: 5% tax on expenses
    }
}

class AustralianTaxCalculator extends TaxCalculator {
    protected static getTaxBrackets(): TaxBracket[] {
        return [
            { maxIncome: 18200, taxRate: 0.00 },
            { maxIncome: 45000, taxRate: 0.19 },
            { maxIncome: 120000, taxRate: 0.325 },
            { maxIncome: Infinity, taxRate: 0.37 }
        ];
    }

    static calculateIncomeTax(payment: number, grossIncome: number): number {
        const taxPercentage = this.getTaxRateForIncome(grossIncome);
        return payment * taxPercentage;
    }

    static calculateExpenseTax(expense: number): number {
        return expense * 0.10; // 10% GST tax on all expenses
    }
}

class TaxCalculatorFactory {
    public getTaxCalculator(country?: Country): typeof TaxCalculator | typeof AustralianTaxCalculator {
        switch (country) {
            case Country.Australia:
                return AustralianTaxCalculator;
            default:
                return TaxCalculator;
        }
    }
}

export { TaxCalculator, AustralianTaxCalculator, TaxCalculatorFactory };