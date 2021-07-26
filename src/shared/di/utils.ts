import {Container} from 'typedi';
import {config} from '~/shared/config';
import {ConfigToken} from '~/shared/di/tokens';

/**
 * Внедряет зависимости.
 */
export function injectDependencies() {
  Container.set(ConfigToken, config);
}
