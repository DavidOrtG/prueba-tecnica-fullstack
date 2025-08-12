import {
  formatCurrency,
  formatDate,
  formatDateShort,
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
  });

  describe('formatDateShort', () => {
    it('should format dates in short format', () => {
      const testDate = new Date('2024-01-15T12:00:00Z');
      const formatted = formatDateShort(testDate);
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  describe('calculateBalance', () => {
    it('should calculate balance correctly with mixed transactions', () => {
      const transactions = [
        { type: 'INCOME', amount: 1000 },
        { type: 'EXPENSE', amount: 300 },
        { type: 'INCOME', amount: 500 },
        { type: 'EXPENSE', amount: 200 },
      ];

      const balance = calculateBalance(transactions as Transaction[]);
      expect(balance).toBe(1000); // 1000 + 500 - 300 - 200
    });

    it('should return 0 for empty transactions', () => {
      const balance = calculateBalance([]);
      expect(balance).toBe(0);
    });

    it('should handle only income transactions', () => {
      const transactions = [
        { type: 'INCOME', amount: 1000 },
        { type: 'INCOME', amount: 500 },
      ];

      const balance = calculateBalance(transactions as Transaction[]);
      expect(balance).toBe(1500);
    });

    it('should handle only expense transactions', () => {
      const transactions = [
        { type: 'EXPENSE', amount: 1000 },
        { type: 'EXPENSE', amount: 500 },
      ];

      const balance = calculateBalance(transactions as Transaction[]);
      expect(balance).toBe(-1500);
    });
  });

  test('exportToCSV should generate CSV data', () => {
    const testData = [
      { name: 'John', age: 30, city: 'New York' },
      { name: 'Jane', age: 25, city: 'Los Angeles' },
    ];

    // Mock browser APIs
    const mockDocument = {
      createElement: jest.fn(() => ({
        setAttribute: jest.fn(),
        click: jest.fn(),
      })),
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

    // Replace global objects
    const originalDocument = global.document;
    const originalBlob = global.Blob;
    const originalURL = global.URL;

    global.document = mockDocument as unknown as Document;
    global.Blob = mockBlob as unknown as typeof Blob;
    global.URL = mockURL as unknown as typeof URL;

    try {
      exportToCSV(testData, 'test.csv');
      expect(mockDocument.createElement).toHaveBeenCalledWith('a');
    } finally {
      // Restore global objects
      global.document = originalDocument;
      global.Blob = originalBlob;
      global.URL = originalURL;
    }
  });
});
