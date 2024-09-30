import { Messaging } from '../../api/messaging';
import { storage } from 'webextension-polyfill';
import {
  MIGRATION_KEY,
  MigrationState,
} from 'nami-migration-tool/migrator/migration-state.data';

const injectScript = () => {
  const script = document.createElement('script');
  script.async = false;
  script.src = chrome.runtime.getURL('injected.bundle.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
};

async function shouldInject() {
  const { laceMigration } = (await storage.local.get(MIGRATION_KEY)) || {
    laceMigration: undefined,
  };
  // Prevent injection into window.cardano namespace if migration has been completed
  if (laceMigration === MigrationState.Completed) return false;
  const documentElement = document.documentElement.nodeName;
  const docElemCheck = documentElement
    ? documentElement.toLowerCase() === 'html'
    : true;
  const { docType } = window.document;
  const docTypeCheck = docType ? docType.name === 'html' : true;
  return docElemCheck && docTypeCheck;
}

if (await shouldInject()) {
  injectScript();
  Messaging.createProxyController();
}
