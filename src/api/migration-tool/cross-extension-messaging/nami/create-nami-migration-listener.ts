import {
  MIGRATION_KEY,
  MigrationState,
} from '../../migrator/migration-state.data';
import { MigrationExceptions } from '../shared/exceptions';
import * as Nami from '../../migrator/nami-storage.data';
import { map } from '../../migrator/nami-storage-mapper.data';
import * as Migration from '../../migrator/migration-data.data';
import { LaceMessages, MessageSender, NamiStore } from '../shared/types';

// Creates a runtime.onMessageExternal event listener as documented here
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessageExternal#addlistener_syntax
export const createNamiMigrationListener =
  (laceExtensionId: string, store: NamiStore) =>
  async (
    message: LaceMessages,
    sender: MessageSender,
  ): Promise<Migration.State | string | undefined> => {
    console.log(
      '[NAMI MIGRATION] createNamiMigrationListener',
      message,
      sender,
    );
    if (sender.id !== laceExtensionId) return undefined;

    if (message.type === 'abort') {
      await store.set({
        [MIGRATION_KEY]: MigrationState.None,
      });
      return;
    }

    if (message.type === 'completed') {
      await store.set({
        [MIGRATION_KEY]: MigrationState.Completed,
      });
      return;
    }

    const data: Partial<Nami.State> = await store.get();

    if (message.type === 'status') {
      return data?.laceMigration ?? MigrationState.None;
    }

    if (message.type === 'data') {
      try {
        return map(data);
      } catch {
        return Promise.reject(MigrationExceptions.FailedToParse);
      }
    }
  };
