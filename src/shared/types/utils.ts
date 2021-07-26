import {Token} from 'typedi';

/**
 * Возвращает возможно отсутствующий тип Т.
 */
export type TMaybe<T> = T | undefined | null;

/**
 * Извлекает тип, находящийся в токене.
 */
export type TExtractTokenType<T extends Token<any>> = T extends Token<infer U>
  ? U : never;