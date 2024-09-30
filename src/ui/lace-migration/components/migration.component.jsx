import React, { useEffect, useState, useMemo } from 'react';
import { storage } from 'webextension-polyfill';
import {
  MIGRATION_KEY,
  MigrationState,
  DISMISS_MIGRATION_UNTIL,
} from 'nami-migration-tool/migrator/migration-state.data';
import { MigrationView } from './migration-view/migration-view.component';
import {
  checkLaceInstallation,
  enableMigration,
  openLace,
} from 'nami-migration-tool/cross-extension-messaging/nami-migration-client.extension';
import { useCaptureEvent } from '../../../features/analytics/hooks';
import { Events } from '../../../features/analytics/events';
import { STORAGE } from '../../../config/config';
import { setStorage, getAccounts } from '../../../api/extension';
import { useFeatureFlagsContext } from '../../../features/feature-flags/provider';
import { App } from '../../app';

export const AppWithMigration = () => {
  const captureEvent = useCaptureEvent();
  const [state, setState] = useState({
    migrationState: MigrationState.None,
    isLaceInstalled: false,
    ui: 'loading',
    hasWallet: false,
    dismissedUntil: undefined,
  });
  const themeColor = localStorage['chakra-ui-color-mode'];
  const { featureFlags } = useFeatureFlagsContext();

  useEffect(() => {
    storage.local.get().then((store) => {
      // Wait for Lace installation check before declaring UI to be ready
      checkLaceInstallation().then((laceInstalled) => {
        // Check if the wallet exists
        getAccounts().then((accounts) => {
          setState((s) => ({
            ...s,
            ui: 'ready',
            isLaceInstalled: laceInstalled,
            migrationState: store[MIGRATION_KEY] ?? MigrationState.None,
            hasWallet: typeof accounts !== 'undefined',
            dismissedUntil: store[DISMISS_MIGRATION_UNTIL] ?? undefined,
          }));
          // Capture events for initial migration state when Nami is opened
          switch (store[MIGRATION_KEY]) {
            case MigrationState.Dismissed:
              return captureEvent(Events.NamiMigrationDismissed);
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
        });
      });
    });
  }, []);

  useEffect(() => {
    const observeMigrationState = async (changes) => {
      setState((s) => ({
        ...s,
        migrationState: changes[MIGRATION_KEY]?.newValue ?? s.migrationState,
        dismissedUntil:
          changes[DISMISS_MIGRATION_UNTIL]?.newValue ?? s.dismissedUntil,
      }));
    };

    storage.local.onChanged.addListener(observeMigrationState);
    return () => storage.onChanged.removeListener(observeMigrationState);
  }, []);

  useEffect(() => {
    setStorage({ [STORAGE.themeColor]: themeColor });
  }, [themeColor]);

  const shouldShowApp = useMemo(() => {
    let showApp = true;
    if (featureFlags?.['is-migration-active'] !== undefined) {
      if (!!featureFlags['is-migration-active'].dismissable) {
        showApp = !!state.dismissedUntil && state.dismissedUntil > Date.now();
      } else {
        showApp = false;
      }
    }
    return showApp;
  }, [state, featureFlags]);

  if (shouldShowApp) {
    return <App />;
  }

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
