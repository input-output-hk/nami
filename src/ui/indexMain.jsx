/**
 * indexMain is the entry point for the extension panel you open at the top right in the browser
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { POPUP } from '../config/config';
import { AnalyticsProvider } from '../features/analytics/provider';
import { EventTracker } from '../features/analytics/event-tracker';
import { ExtensionViews } from '../features/analytics/types';
import { Migration } from './lace-migration/components/migration.component';
import Theme from './theme';

const root = createRoot(window.document.querySelector(`#${POPUP.main}`));
root.render(
  <AnalyticsProvider view={ExtensionViews.Popup}>
    <Theme>
      <EventTracker />
      <Migration />
    </Theme>
  </AnalyticsProvider>
);

if (module.hot) module.hot.accept();
