import {createHash} from 'crypto';

/**
 * Из переданного значения генерирует хэш указанной максимальной длины.
 * @param buffer
 * @param maxLength
 */
export function hash256(buffer: Buffer | string, maxLength = 256): string {
  return createHash('sha256')
    .update(buffer)
    .digest('hex')
    .slice(0, maxLength);
}