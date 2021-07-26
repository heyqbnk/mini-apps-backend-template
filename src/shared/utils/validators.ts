/**
 * Утверждает что значение является объектом.
 * @param value
 * @returns {value is Record<string, unknown>}
 */
export function isObject(value: any): value is Record<string, unknown> {
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

/**
 * Утверждает что value является undefined.
 * @param value
 * @returns {value is undefined}
 */
export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined';
}

/**
 * Утверждает что значение является массивом.
 * @param value
 * @returns {value is Array<unknown>}
 */
export function isArray(value: any): value is Array<unknown> {
  return Array.isArray(value);
}
