/**
 * Type Guards and Utility Functions
 * Provides safe type checking and defensive programming utilities
 */

// Safe number operations
export const safeNumber = (value: unknown, defaultValue: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  return defaultValue;
};

// Safe string operations
export const safeString = (value: unknown, defaultValue: string = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  return defaultValue;
};

// Safe division to avoid division by zero
export const safeDivide = (numerator: number, denominator: number, defaultValue: number = 0): number => {
  if (denominator === 0) {
    return defaultValue;
  }
  return numerator / denominator;
};

// Safe percentage calculation
export const safePercentage = (value: number, total: number, max: number = 100): number => {
  if (total === 0) return 0;
  return Math.min((value / total) * 100, max);
};

// Safe property access for objects with index signatures
export const safeGet = <T>(obj: Record<string, any> | undefined, key: string, defaultValue: T): T => {
  if (obj && key in obj) {
    return obj[key] as T;
  }
  return defaultValue;
};