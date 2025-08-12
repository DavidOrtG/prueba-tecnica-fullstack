import {
  formatCurrency,
  formatDate,
  formatDateShort,
  safeParseDate,
  toDateInputValue,
  formatDateForExport,
  calculateBalance,
  exportToCSV,
} from '@/lib/utils';
import { Transaction } from '@/lib/types';

describe('Utils Functions', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      // Test the actual output format (including non-breaking spaces)
      expect(formatCurrency(1000)).toMatch(/^\$[^\S]*1\.000$/);
      expect(formatCurrency(1500000)).toMatch(/^\$[^\S]*1\.500\.000$/);
      expect(formatCurrency(0)).toMatch(/^\$[^\S]*0$/);
    });

    it('should format decimal numbers correctly', () => {
      expect(formatCurrency(1000.5)).toMatch(/^\$[^\S]*1\.001$/);
      expect(formatCurrency(999.99)).toMatch(/^\$[^\S]*1\.000$/);
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-1000)).toMatch(/^-\$[^\S]*1\.000$/);
    });
  });

  describe('formatDate', () => {
    it('should format date strings correctly', () => {
      // Use a specific date that won't have timezone issues
      const testDate = new Date('2024-01-15T12:00:00Z');
      const formatted = formatDate(testDate);
      expect(formatted).toContain('15');
      expect(formatted).toContain('enero');
      expect(formatted).toContain('2024');
    });

    it('should format date strings from ISO format', () => {
      const formatted = formatDate(new Date('2024-01-15T10:30:00Z'));
      expect(formatted).toContain('15');
      expect(formatted).toContain('enero');
      expect(formatted).toContain('2024');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Fecha inválida');
    });
  });

  describe('formatDateShort', () => {
    it('should format dates in short format', () => {
      const testDate = new Date('2024-01-15T12:00:00Z');
      const formatted = formatDateShort(testDate);
      // The actual format is "15 de ene de 2024" for es-CO locale
      expect(formatted).toContain('15');
      expect(formatted).toContain('ene');
      expect(formatted).toContain('2024');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDateShort('invalid-date');
      expect(result).toBe('Fecha inválida');
    });
  });

  describe('safeParseDate', () => {
    it('should return the same Date object if input is already a Date', () => {
      const testDate = new Date('2024-01-15T12:00:00Z');
      const result = safeParseDate(testDate);
      expect(result).toBe(testDate);
    });

    it('should parse valid date strings correctly', () => {
      const result = safeParseDate('2024-01-15T12:00:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result!.getTime()).toBe(
        new Date('2024-01-15T12:00:00Z').getTime()
      );
    });

    it('should return null for invalid date strings', () => {
      const result = safeParseDate('invalid-date');
      expect(result).toBeNull();
    });

    it('should handle various date formats', () => {
      const isoDate = safeParseDate('2024-01-15T12:00:00Z');
      const shortDate = safeParseDate('2024-01-15');

      expect(isoDate).toBeInstanceOf(Date);
      expect(shortDate).toBeInstanceOf(Date);
      expect(isoDate!.getFullYear()).toBe(2024);
      expect(shortDate!.getFullYear()).toBe(2024);

      // Test that slash format returns null (invalid format)
      const slashDate = safeParseDate('15/01/2024');
      expect(slashDate).toBeNull();
    });
  });

  describe('toDateInputValue', () => {
    it('should convert date to YYYY-MM-DD format', () => {
      const testDate = new Date('2024-01-15T12:00:00Z');
      const result = toDateInputValue(testDate);
      expect(result).toBe('2024-01-15');
    });

    it('should handle date strings', () => {
      const result = toDateInputValue('2024-01-15T12:00:00Z');
      expect(result).toBe('2024-01-15');
    });

    it('should handle invalid dates by returning current date format', () => {
      const result = toDateInputValue('invalid-date');
      const today = new Date();
      const expected = today.toISOString().split('T')[0];
      expect(result).toBe(expected);
    });
  });

  describe('formatDateForExport', () => {
    it('should format date for CSV export', () => {
      const testDate = new Date('2024-01-15T12:00:00Z');
      const result = formatDateForExport(testDate);
      // Should be in DD/MM/YYYY format for es-CO locale
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDateForExport('invalid-date');
      expect(result).toBe('Fecha inválida');
    });

    it('should use consistent locale formatting', () => {
      const testDate = new Date('2024-01-15T12:00:00Z');
      const result = formatDateForExport(testDate);
      // Should be in DD/MM/YYYY format for es-CO locale
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  describe('calculateBalance', () => {
    it('should calculate balance correctly with mixed transactions', () => {
      const transactions = [
        { type: 'INCOME', amount: 1000 } as Transaction,
        { type: 'EXPENSE', amount: 300 } as Transaction,
        { type: 'INCOME', amount: 500 } as Transaction,
        { type: 'EXPENSE', amount: 200 } as Transaction,
      ];

      const balance = calculateBalance(transactions);
      expect(balance).toBe(1000); // 1000 + 500 - 300 - 200
    });

    it('should return 0 for empty transactions', () => {
      const balance = calculateBalance([]);
      expect(balance).toBe(0);
    });

    it('should handle only income transactions', () => {
      const transactions = [
        { type: 'INCOME', amount: 1000 } as Transaction,
        { type: 'INCOME', amount: 500 } as Transaction,
      ];

      const balance = calculateBalance(transactions);
      expect(balance).toBe(1500);
    });

    it('should handle only expense transactions', () => {
      const transactions = [
        { type: 'EXPENSE', amount: 1000 } as Transaction,
        { type: 'EXPENSE', amount: 500 } as Transaction,
      ];

      const balance = calculateBalance(transactions);
      expect(balance).toBe(-1500);
    });
  });

  describe('exportToCSV', () => {
    it('should generate CSV data', () => {
      const testData = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' },
      ];

      // Mock browser APIs
      const mockElement = {
        setAttribute: jest.fn(),
        click: jest.fn(),
        style: {},
      };

      const mockDocument = {
        createElement: jest.fn(() => mockElement),
        body: {
          appendChild: jest.fn(),
          removeChild: jest.fn(),
        },
      };

      const mockBlob = jest.fn();
      const mockURL = {
        createObjectURL: jest.fn(() => 'mock-url'),
        revokeObjectURL: jest.fn(),
      };

      // Store original globals
      const originalDocument = global.document;
      const originalBlob = global.Blob;
      const originalURL = global.URL;

      // Replace global objects
      (global as any).document = mockDocument;
      (global as any).Blob = mockBlob;
      (global as any).URL = mockURL;

      try {
        exportToCSV(testData, 'test.csv');
        expect(mockDocument.createElement).toHaveBeenCalledWith('a');
        expect(mockElement.setAttribute).toHaveBeenCalledWith(
          'href',
          'mock-url'
        );
        expect(mockElement.setAttribute).toHaveBeenCalledWith(
          'download',
          'test.csv'
        );
      } finally {
        // Restore global objects
        (global as any).document = originalDocument;
        (global as any).Blob = originalBlob;
        (global as any).URL = originalURL;
      }
    });

    it('should handle empty data gracefully', () => {
      const mockElement = {
        setAttribute: jest.fn(),
        click: jest.fn(),
        style: {},
      };

      const mockDocument = {
        createElement: jest.fn(() => mockElement),
        body: {
          appendChild: jest.fn(),
          removeChild: jest.fn(),
        },
      };

      const mockBlob = jest.fn();
      const mockURL = {
        createObjectURL: jest.fn(() => 'mock-url'),
        revokeObjectURL: jest.fn(),
      };

      const originalDocument = global.document;
      const originalBlob = global.Blob;
      const originalURL = global.URL;

      (global as any).document = mockDocument;
      (global as any).Blob = mockBlob;
      (global as any).URL = mockURL;

      try {
        exportToCSV([], 'empty.csv');
        expect(mockDocument.createElement).toHaveBeenCalledWith('a');
        expect(mockElement.setAttribute).toHaveBeenCalledWith(
          'href',
          'mock-url'
        );
        expect(mockElement.setAttribute).toHaveBeenCalledWith(
          'download',
          'empty.csv'
        );
      } finally {
        (global as any).document = originalDocument;
        (global as any).Blob = originalBlob;
        (global as any).URL = originalURL;
      }
    });
  });
});
