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

export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

export const formatDateShort = (date: Date): string =>
  new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);

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
