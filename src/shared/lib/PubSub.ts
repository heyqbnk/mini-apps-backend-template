import {PubSub as GqlPubSub, PubSubOptions} from 'graphql-subscriptions';
import {worker, isWorker, isMaster, workers} from 'cluster';
import {defaultErrorCatcher, isRecord, isString} from '~/shared/utils';
import {Service} from 'typedi';

const PUB_SUB_MESSAGE = 'PUB_SUB_MESSAGE';

interface IPubSubMessage {
  type: typeof PUB_SUB_MESSAGE;
  triggerName: string;
  payload?: any;
}

function isPubSubMessage(value: any): value is IPubSubMessage {
  return isRecord(value) &&
    value.type === PUB_SUB_MESSAGE &&
    isString(value.triggerName);
}

/**
 * Мульти-поточный провайдер для PubSub.
 */
export class PubSubProvider {
  init() {
    if (!isMaster) {
      throw new Error('Невозможно создать PubSubProvider не в главном потоке');
    }
    if (process.send === undefined) {
      throw new Error('process.send не объявлен');
    }
    const workersArray = Object
      .values(workers)
      .filter((w): w is Exclude<typeof w, undefined> => w !== undefined);

    workersArray.forEach(w => {
      // Слушаем от каждого потока запросы на публикацию событий. В
      // случае, когда это происходит, необходимо уведомить все потоки
      // о том, что эту публикацию необходимо выполнить.
      w.on('message', message => {
        if (isPubSubMessage(message)) {
          workersArray.forEach(w => w.send(message));
        }
      });
    });
  }
}

/**
 * Кастомный PubSub.
 */
@Service()
export class PubSub<EventsMap extends Record<string, any>> extends GqlPubSub {
  constructor(props?: PubSubOptions) {
    super(props);

    // При получении сообщения от других воркеров о том, что необходимо
    // опубликовать событие, публикуем его.
    if (isWorker) {
      worker.on('message', async message => {
        if (isPubSubMessage(message)) {
          super
            .publish(message.triggerName, message.payload)
            .catch(defaultErrorCatcher);
        }
      });
    }
  }

  async publish<E extends (keyof EventsMap & string)>(
    triggerName: E,
    payload: EventsMap[E],
  ): Promise<void> {
    // В случае, когда мы в мульти-поточном режиме, просто уведомляем все
    // потоки о необходимости выполнения публикации. Код в конструкторе
    // эту публикацию выполнит сам.
    if (isWorker) {
      // При публикации события не забываем уведомить остальные потоки.
      const message: IPubSubMessage = {
        type: PUB_SUB_MESSAGE,
        triggerName,
        payload,
      };
      worker.send(message);
      return;
    }
    return super.publish(triggerName, payload);
  }
}