import React, { useEffect, useState } from 'react';
import { storage } from 'webextension-polyfill';
import {
  MIGRATION_KEY,
  MigrationState,
} from '@xsy/nami-migration-tool/dist/migrator/migration-state.data';
import { MigrationView } from './migration-view/migration-view.component';
import {
  checkLaceInstallation,
  enableMigration,
  openLace,
} from '@xsy/nami-migration-tool/dist/cross-extension-messaging/nami-migration-client.extension';
import { useCaptureEvent } from '../../../features/analytics/hooks';
import { Events } from '../../../features/analytics/events';
import { STORAGE } from '../../../config/config';
import { setStorage, getAccounts } from '../../../api/extension';

export const Migration = () => {
  const captureEvent = useCaptureEvent();
  const [state, setState] = useState({
    migrationState: MigrationState.None,
    isLaceInstalled: false,
    ui: 'loading',
    hasWallet: false,
  });
  const themeColor = localStorage['chakra-ui-color-mode'];

  useEffect(() => {
    storage.local.get().then((store) => {
      // Wait for Lace installation check before declaring UI to be ready
      checkLaceInstallation().then((laceInstalled) => {
        // Check if the wallet exists
        getAccounts().then((accounts) =>{
          setState((s) => ({
            ...s,
            ui: 'ready',
            isLaceInstalled: laceInstalled,
            migrationState: store[MIGRATION_KEY] ?? MigrationState.None,
            hasWallet: typeof(accounts) !== 'undefined',
          }));
          // Capture events for initial migration state when Nami is opened
          switch (store[MIGRATION_KEY]) {
            case undefined:
            case MigrationState.None:
              return captureEvent(Events.NamiOpenedMigrationNotStarted);
            case MigrationState.InProgress:
              return laceInstalled
                ? captureEvent(Events.NamiOpenedMigrationInProgress)
                : captureEvent(Events.NamiOpenedMigrationWaitingForLace);
            case MigrationState.Completed:
              return captureEvent(Events.NamiOpenedMigrationCompleted);
          }
        })
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

  useEffect(() => {
    setStorage({ [STORAGE.themeColor]: themeColor })
  }, [themeColor]);

  return state.ui === 'loading' ? null : (
    <MigrationView
      migrationState={state.migrationState}
      isLaceInstalled={state.isLaceInstalled}
      hasWallet={state.hasWallet}
      onSlideSwitched={async (nextSlideIndex) => {
        await captureEvent(Events.MigrationSlideSwitched);
        await captureEvent(Events.MigrationSlideViewed, {
          slideIndex: nextSlideIndex,
        });
      }}
      onUpgradeWalletClicked={() => {
        enableMigration();
        captureEvent(Events.MigrationUpgradeYourWalletClicked);
      }}
      onWaitingForLaceScreenViewed={() => {
        captureEvent(Events.MigrationDownloadLaceScreenViewed);
      }}
      onOpenLaceScreenViewed={() => {
        captureEvent(Events.MigrationOpenLaceScreenViewed);
      }}
      onDownloadLaceClicked={() => {
        captureEvent(Events.MigrationDownloadLaceClicked);
        window.open('https://www.lace.io/');
      }}
      onOpenLaceClicked={() => {
        captureEvent(Events.MigrationOpenLaceClicked);
        openLace();
      }}
      onAllDoneScreenViewed={() => {
        captureEvent(Events.MigrationAllDoneScreenViewed);
      }}
      onNoWalletActionClick={() => {
        if (state.isLaceInstalled) {
          captureEvent(Events.MigrationOpenLaceClicked);
          openLace();
        } else {
          captureEvent(Events.MigrationDownloadLaceClicked);
          window.open('https://www.lace.io/');
        }
      }}
    />
  );
};
