// Enable requiring TypeScript files from JS tests
require('ts-node/register');

const { expect } = require('chai');

// Import the calculators and Country enum from TypeScript sources
const {
	FinancialYearCalculator,
	AustralianFinancialYearCalculator,
	USFinancialYearCalculator,
	UKFinancialYearCalculator,
	CanadianFinancialYearCalculator,
	CalendarYearCalculator,
	FinancialYearCalculatorFactory
} = require('../classes/FinancialYearCalculator');

const { Country } = require('../types/globalTypes');

describe('FinancialYearCalculator', () => {
	describe('AustralianFinancialYearCalculator', () => {
		it('should return FY2024-2025 for 2025-06-30 (end of FY)', () => {
			const calc = new AustralianFinancialYearCalculator();
			const date = new Date(2025, 5, 30); // June 30, 2025
			const fy = calc.getFinancialYear(date);

			expect(fy.start.getFullYear()).to.equal(2024);
			expect(fy.start.getMonth()).to.equal(6); // July (0-based)
			expect(fy.start.getDate()).to.equal(1);

			expect(fy.end.getFullYear()).to.equal(2025);
			expect(fy.end.getMonth()).to.equal(5); // June
			expect(fy.end.getDate()).to.equal(30);

			expect(fy.label).to.equal('FY2024-2025');
		});

		it('should return FY2025-2026 for 2025-07-01 (start of FY)', () => {
			const calc = new AustralianFinancialYearCalculator();
			const date = new Date(2025, 6, 1); // July 1, 2025
			const fy = calc.getFinancialYear(date);

			expect(fy.start.getFullYear()).to.equal(2025);
			expect(fy.start.getMonth()).to.equal(6);
			expect(fy.start.getDate()).to.equal(1);

			expect(fy.end.getFullYear()).to.equal(2026);
			expect(fy.end.getMonth()).to.equal(5);
			expect(fy.end.getDate()).to.equal(30);

			expect(fy.label).to.equal('FY2025-2026');
		});
	});

	describe('USFinancialYearCalculator', () => {
		it('should return FY2024-2025 for 2025-09-30 (end of FY)', () => {
			const calc = new USFinancialYearCalculator();
			const date = new Date(2025, 8, 30); // Sept 30, 2025
			const fy = calc.getFinancialYear(date);

			expect(fy.start.getFullYear()).to.equal(2024);
			expect(fy.start.getMonth()).to.equal(9); // October
			expect(fy.start.getDate()).to.equal(1);

			expect(fy.end.getFullYear()).to.equal(2025);
			expect(fy.end.getMonth()).to.equal(8); // September
			expect(fy.end.getDate()).to.equal(30);

			expect(fy.label).to.equal('FY2024-2025');
		});

		it('should return FY2025-2026 for 2025-10-01 (start of FY)', () => {
			const calc = new USFinancialYearCalculator();
			const date = new Date(2025, 9, 1); // Oct 1, 2025
			const fy = calc.getFinancialYear(date);

			expect(fy.start.getFullYear()).to.equal(2025);
			expect(fy.start.getMonth()).to.equal(9);
			expect(fy.start.getDate()).to.equal(1);

			expect(fy.end.getFullYear()).to.equal(2026);
			expect(fy.end.getMonth()).to.equal(8);
			expect(fy.end.getDate()).to.equal(30);

			expect(fy.label).to.equal('FY2025-2026');
		});
	});

	describe('UKFinancialYearCalculator', () => {
		it('should return FY2024-2025 for 2025-04-05 (end of FY)', () => {
			const calc = new UKFinancialYearCalculator();
			const date = new Date(2025, 3, 5); // April 5, 2025
			const fy = calc.getFinancialYear(date);

			expect(fy.start.getFullYear()).to.equal(2024);
			expect(fy.start.getMonth()).to.equal(3); // April
			expect(fy.start.getDate()).to.equal(6);

			expect(fy.end.getFullYear()).to.equal(2025);
			expect(fy.end.getMonth()).to.equal(3);
			expect(fy.end.getDate()).to.equal(5);

			expect(fy.label).to.equal('FY2024-2025');
		});

		it('should return FY2025-2026 for 2025-04-06 (start of FY)', () => {
			const calc = new UKFinancialYearCalculator();
			const date = new Date(2025, 3, 6); // April 6, 2025
			const fy = calc.getFinancialYear(date);

			expect(fy.start.getFullYear()).to.equal(2025);
			expect(fy.start.getMonth()).to.equal(3);
			expect(fy.start.getDate()).to.equal(6);

			expect(fy.end.getFullYear()).to.equal(2026);
			expect(fy.end.getMonth()).to.equal(3);
			expect(fy.end.getDate()).to.equal(5);

			expect(fy.label).to.equal('FY2025-2026');
		});
	});

	describe('CanadianFinancialYearCalculator', () => {
		it('should return FY2024-2025 for 2025-03-31 (end of FY)', () => {
			const calc = new CanadianFinancialYearCalculator();
			const date = new Date(2025, 2, 31); // March 31, 2025
			const fy = calc.getFinancialYear(date);

			expect(fy.start.getFullYear()).to.equal(2024);
			expect(fy.start.getMonth()).to.equal(3); // April
			expect(fy.start.getDate()).to.equal(1);

			expect(fy.end.getFullYear()).to.equal(2025);
			expect(fy.end.getMonth()).to.equal(2); // March
			expect(fy.end.getDate()).to.equal(31);

			expect(fy.label).to.equal('FY2024-2025');
		});

		it('should return FY2025-2026 for 2025-04-01 (start of FY)', () => {
			const calc = new CanadianFinancialYearCalculator();
			const date = new Date(2025, 3, 1); // April 1, 2025
			const fy = calc.getFinancialYear(date);

			expect(fy.start.getFullYear()).to.equal(2025);
			expect(fy.start.getMonth()).to.equal(3);
			expect(fy.start.getDate()).to.equal(1);

			expect(fy.end.getFullYear()).to.equal(2026);
			expect(fy.end.getMonth()).to.equal(2);
			expect(fy.end.getDate()).to.equal(31);

			expect(fy.label).to.equal('FY2025-2026');
		});
	});

	describe('CalendarYearCalculator', () => {
		it('should return FY2025-2026 for 2025-09-24', () => {
			const calc = new CalendarYearCalculator();
			const date = new Date(2025, 8, 24); // Sept 24, 2025
			const fy = calc.getFinancialYear(date);

			expect(fy.start.getFullYear()).to.equal(2025);
			expect(fy.start.getMonth()).to.equal(0);
			expect(fy.start.getDate()).to.equal(1);

			expect(fy.end.getFullYear()).to.equal(2025);
			expect(fy.end.getMonth()).to.equal(11);
			expect(fy.end.getDate()).to.equal(31);

			expect(fy.label).to.equal('FY2025-2025');
		});
	});

	describe('FinancialYearCalculatorFactory', () => {
		it('should return correct calculator for Country enum values', () => {
			const aus = FinancialYearCalculatorFactory.getCalculator(Country.Australia);
			expect(aus).to.be.instanceOf(AustralianFinancialYearCalculator);

			const us = FinancialYearCalculatorFactory.getCalculator(Country.UnitedStates);
			expect(us).to.be.instanceOf(USFinancialYearCalculator);

			const uk = FinancialYearCalculatorFactory.getCalculator(Country.UnitedKingdom);
			expect(uk).to.be.instanceOf(UKFinancialYearCalculator);

			const ca = FinancialYearCalculatorFactory.getCalculator(Country.Canada);
			expect(ca).to.be.instanceOf(CanadianFinancialYearCalculator);

			const other = FinancialYearCalculatorFactory.getCalculator('Mars');
			expect(other).to.be.instanceOf(CalendarYearCalculator);
		});
	});

	// Edge cases leap years 
	describe('Leap Year Cases', () => {
		it('should handle leap year for AustralianFinancialYearCalculator', () => {

			const date = new Date(2024, 1, 29); // Feb 29, 2024 (leap year)
			const calc = new AustralianFinancialYearCalculator(); // Feb 29, 2024 (leap year)
			const fy = calc.getFinancialYear(date);
			expect(fy.start.getFullYear()).to.equal(2023);
			expect(fy.start.getMonth()).to.equal(6); // July (0-based)
			expect(fy.start.getDate()).to.equal(1);
			expect(fy.end.getFullYear()).to.equal(2024);
			expect(fy.end.getMonth()).to.equal(5);    // June
			expect(fy.end.getDate()).to.equal(30);
			expect(fy.label).to.equal('FY2023-2024');
		});
	});
});

// file properly closed


