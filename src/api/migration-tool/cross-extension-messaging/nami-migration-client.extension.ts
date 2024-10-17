import { runtime, storage } from 'webextension-polyfill';

import {
  MigrationState,
  MIGRATION_KEY,
  DISMISS_MIGRATION_UNTIL,
} from '../migrator/migration-state.data';
import { setMigrationToInProgress } from './nami/set-migration-to-in-progress';
import { LACE_EXTENSION_ID } from './nami/environment';
import { createNamiMigrationListener } from './nami/create-nami-migration-listener';
import { NamiMessages } from './shared/types';
import { awaitLacePongResponse } from './nami/await-lace-pong-response';

export const checkLaceInstallation = () =>
  awaitLacePongResponse(LACE_EXTENSION_ID, runtime.sendMessage);

export const enableMigration = () => {
  storage.local.remove(DISMISS_MIGRATION_UNTIL);
  return setMigrationToInProgress(storage.local);
};

export const dismissMigration = ({
  dismissMigrationUntil,
}: {
  dismissMigrationUntil: number;
}) => {
  storage.local.set({
    [MIGRATION_KEY]: MigrationState.Dismissed,
    [DISMISS_MIGRATION_UNTIL]: dismissMigrationUntil,
  });
};

export const disableMigration = () =>
  storage.local.set({
    [MIGRATION_KEY]: MigrationState.None,
  });

export const handleLaceMigrationRequests = () =>
  runtime.onMessageExternal.addListener(
    createNamiMigrationListener(LACE_EXTENSION_ID, storage.local)
  );

export const openLace = () => {
  runtime.sendMessage(LACE_EXTENSION_ID, NamiMessages.open);
};
