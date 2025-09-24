import { Country } from "../types/globalTypes";

interface TaxBracket {
    maxIncome: number;
    taxRate: number;
}

class TaxCalculator {
    protected static getTaxBrackets(): TaxBracket[] {
        return [
            { maxIncome: 9875, taxRate: 0.10 },      // 10% up to $9,875
            { maxIncome: 40125, taxRate: 0.12 },     // 12% from $9,876 to $40,125
            { maxIncome: 85525, taxRate: 0.22 },     // 22% from $40,126 to $85,525
            { maxIncome: Infinity, taxRate: 0.24 }   // 24% above $85,525
        ];
    }

    protected static getTaxRateForIncome(grossIncome: number): number {
        const taxBrackets = this.getTaxBrackets();
        let taxPercentage = 0;
        
        for (const bracket of taxBrackets) {
            if (grossIncome <= bracket.maxIncome) {
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
            { maxIncome: 18200, taxRate: 0.00 },     // Tax-free threshold up to $18,200
            { maxIncome: 45000, taxRate: 0.19 },     // 19% from $18,201 to $45,000
            { maxIncome: 120000, taxRate: 0.325 },   // 32.5% from $45,001 to $120,000
            { maxIncome: Infinity, taxRate: 0.37 }   // 37% above $120,000
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