import crypto from 'crypto';

/**
 * Генерирует имя файла в зависимости от переданного буфера.
 * @param {Buffer} buffer
 * @returns {string}
 */
export function hash256(buffer: Buffer | string): string {
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex')
    .slice(0, 256);
}