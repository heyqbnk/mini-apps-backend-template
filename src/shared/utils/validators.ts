/**
 * Утверждает что значение является объектом.
 * @param value
 * @returns {value is Record<string, unknown>}
 */
export function isRecord(value: any): value is Record<string, unknown> {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

/**
 * Утверждает что значение является булевым типом.
 * @param value
 * @returns {value is boolean}
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Утверждает что значение является строкой.
 * @param value
 * @returns {value is string}
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * Утверждает что значение является числом.
 * @param value
 * @returns {value is number}
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number';
}
