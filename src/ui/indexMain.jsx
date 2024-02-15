/**
 * indexMain is the entry point for the extension panel you open at the top right in the browser
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { POPUP } from '../config/config';
import { AnalyticsConsentModal } from '../features/analytics/ui/AnalyticsConsentModal';
import Main from './index';
import { Box, Spinner } from '@chakra-ui/react';
import Welcome from './app/pages/welcome';
import Wallet from './app/pages/wallet';
import { getAccounts } from '../api/extension';
import Settings from './app/pages/settings';
import Send from './app/pages/send';
import { useStoreActions, useStoreState } from 'easy-peasy';
import {
  AnalyticsProvider,
  useAnalyticsContext,
} from '../features/analytics/provider';
import { EventTracker } from '../features/analytics/event-tracker';
import { ExtensionViews } from '../features/analytics/types';
import { TermsAndPrivacyProvider } from '../features/terms-and-privacy';

const App = () => {
  const route = useStoreState((state) => state.globalModel.routeStore.route);
  const setRoute = useStoreActions(
    (actions) => actions.globalModel.routeStore.setRoute
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(true);
  const [analytics, setAnalyticsConsent] = useAnalyticsContext();
  const init = async () => {
    const hasWallet = await getAccounts();
    if (hasWallet) {
      navigate('/wallet');
      // Set route from localStorage if available
      if (route && route !== '/wallet') {
        route
          .slice(1)
          .split('/')
          .reduce((acc, r) => {
            const fullRoute = acc + `/${r}`;
            navigate(fullRoute);
            return fullRoute;
          }, '');
      }
    } else {
      navigate('/welcome');
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    init();
  }, []);

  React.useEffect(() => {
    if (!isLoading) {
      setRoute(location.pathname);
    }
  }, [location, isLoading, setRoute]);

  return isLoading ? (
    <Box
      height="full"
      width="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner color="teal" speed="0.5s" />
    </Box>
  ) : (
    <div style={{ overflowX: 'hidden' }}>
      <Routes>
        <Route
          path="*"
          element={
            <TermsAndPrivacyProvider>
              <Wallet />
            </TermsAndPrivacyProvider>
          }
        />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/settings/*" element={<Settings />} />
        <Route path="/send" element={<Send />} />
      </Routes>
      <AnalyticsConsentModal
        askForConsent={analytics.consent === undefined}
        setConsent={setAnalyticsConsent}
      />
    </div>
  );
};

const root = createRoot(window.document.querySelector(`#${POPUP.main}`));
root.render(
  <AnalyticsProvider view={ExtensionViews.Popup}>
    <EventTracker />
    <Main>
      <Router>
        <App />
      </Router>
    </Main>
  </AnalyticsProvider>
);

if (module.hot) module.hot.accept();
