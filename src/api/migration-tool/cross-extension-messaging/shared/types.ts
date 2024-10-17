import * as Nami from '../../migrator/nami-storage.data';

export interface MessageSender {
  id?: string;
}

export type SendMessageToExtension = (
  id: string,
  message: unknown,
) => Promise<string | void>;

export enum NamiLacePingProtocol {
  ping = 'ping',
  pong = 'pong',
}

export type NamiStore = {
  set: (value: Partial<Nami.State>) => Promise<void>;
  get: () => Promise<Partial<Nami.State>>;
};

export type LaceMessages =
  | {
      type: 'status';
    }
  | {
      type: 'data';
    }
  | {
      type: 'abort';
    }
  | {
      type: 'completed';
    };

export enum NamiMessages {
  'open' = 'open',
}
