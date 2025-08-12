import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Transaction } from './types';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * Safely converts a date string or Date object to a Date
 * Handles various date formats and returns null for invalid dates
 */
export const safeParseDate = (date: Date | string): Date | null => {
  if (date instanceof Date) {
    return date;
  }

  // Try to parse the date string
  const parsed = new Date(date);

  // Check if the date is valid
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // If parsing fails, return null
  return null;
};

/**
 * Converts a date to YYYY-MM-DD format for HTML date inputs
 * Handles timezone issues by using local date methods
 */
export const toDateInputValue = (date: Date | string): string => {
  const dateObj = safeParseDate(date);

  if (!dateObj) {
    // Return current date format for invalid dates
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Use local date methods to avoid timezone issues
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Formats a date for display with full month name
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = safeParseDate(date);

  // Check if the date is valid
  if (!dateObj) {
    return 'Fecha inválida';
  }

  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Formats a date for display with short month name
 */
export const formatDateShort = (date: Date | string): string => {
  const dateObj = safeParseDate(date);

  // Check if the date is valid
  if (!dateObj) {
    return 'Fecha inválida';
  }

  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Formats a date for CSV export with consistent locale
 */
export const formatDateForExport = (date: Date | string): string => {
  const dateObj = safeParseDate(date);

  if (!dateObj) {
    return 'Fecha inválida';
  }

  return dateObj.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const calculateBalance = (transactions: Transaction[]): number =>
  transactions.reduce((balance, transaction) => {
    if (transaction.type === 'INCOME') {
      return balance + transaction.amount;
    } else {
      return balance - transaction.amount;
    }
  }, 0);

export const exportToCSV = (
  data: Record<string, unknown>[],
  filename: string
): void => {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map((row) => headers.map((header) => `"${row[header]}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
