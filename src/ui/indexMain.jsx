/**
 * indexMain is the entry point for the extension panel you open at the top right in the browser
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { POPUP } from '../config/config';
import { EventTracker } from '../features/analytics/event-tracker';
import { ExtensionViews } from '../features/analytics/types';
import { AppWithMigration } from './lace-migration/components/migration.component';
import Theme from './theme';
import { BrowserRouter as Router } from 'react-router-dom';
import Main from './index';
import { AnalyticsProvider } from '../features/analytics/provider';

const root = createRoot(window.document.querySelector(`#${POPUP.main}`));
root.render(
  <AnalyticsProvider view={ExtensionViews.Popup}>
    <Theme>
      <EventTracker />
      <Main>
        <Router>
          <AppWithMigration />
        </Router>
      </Main>
    </Theme>
  </AnalyticsProvider>
);

if (module.hot) module.hot.accept();
