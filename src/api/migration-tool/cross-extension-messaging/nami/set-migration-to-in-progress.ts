import {
  MIGRATION_KEY,
  MigrationState,
} from '../../migrator/migration-state.data';
import { NamiStore } from '../shared/types';

export const setMigrationToInProgress = (store: NamiStore) => {
  return store.set({ [MIGRATION_KEY]: MigrationState.InProgress });
};
