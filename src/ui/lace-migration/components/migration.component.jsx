import React, { useEffect, useState } from 'react';
import { storage } from 'webextension-polyfill';
import {
  MIGRATION_KEY,
  MigrationState,
} from '@xsy/nami-migration-tool/dist/migrator/migration-state.data';
import { MigrationView } from './migration-view/migration-view.component';
import {
  enableMigration,
  openLace,
} from '@xsy/nami-migration-tool/dist/cross-extension-messaging/nami-migration-client.extension';

export const Migration = () => {
  const [state, setState] = useState({
    migrationState: MigrationState.None,
    ui: 'loading',
  });

  useEffect(() => {
    storage.local.get().then((result) => {
      setState({
        ui: 'ready',
        migrationState: result[MIGRATION_KEY] ?? MigrationState.None,
      });
    });
  }, []);

  useEffect(() => {
    const observeMigrationState = async (changes) => {
      setState((s) => ({
        ...s,
        migrationState: changes[MIGRATION_KEY]?.newValue ?? s.migrationState,
      }));
    };

    storage.local.onChanged.addListener(observeMigrationState);
    return () => storage.onChanged.removeListener(observeMigrationState);
  }, []);

  if (state.migrationState === MigrationState.WaitingForLace) {
    enableMigration();
  }

  return state.ui === 'loading' ? null : (
    <MigrationView
      migrationState={state.migrationState}
      onUpgradeWalletClicked={enableMigration}
      onDownloadLaceClicked={() => window.open('https://www.lace.io/')}
      onOpenLaceClicked={openLace}
    />
  );
};
