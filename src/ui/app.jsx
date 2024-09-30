import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AnalyticsConsentModal } from '../features/analytics/ui/AnalyticsConsentModal';
import { Box, Spinner } from '@chakra-ui/react';
import Welcome from './app/pages/welcome';
import Wallet from './app/pages/wallet';
import { getAccounts } from '../api/extension';
import Settings from './app/pages/settings';
import Send from './app/pages/send';
import { useStoreActions, useStoreState } from 'easy-peasy';
import { useAnalyticsContext } from '../features/analytics/provider';
import { TermsAndPrivacyProvider } from '../features/terms-and-privacy';
import { useFeatureFlagsContext } from '../features/feature-flags/provider';
import { storage } from 'webextension-polyfill';

export const App = () => {
  const route = useStoreState((state) => state.globalModel.routeStore.route);
  const setRoute = useStoreActions(
    (actions) => actions.globalModel.routeStore.setRoute
  );
  const featureFlags = useFeatureFlagsContext();
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

  //console.log(sd);
  storage.local.get().then((store) => {
    console.log('store', { store });
  });

  /*if (
      !!featureFlags?.['is-migration-active'] &&
      !featureFlags['is-migration-active'].dismissable
    ) {
      console.log('we active');
      return <Migration />;
    }*/

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
