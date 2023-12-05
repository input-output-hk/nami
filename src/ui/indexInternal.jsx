/**
 * indexInternal is the entry point for the popup windows (e.g. data signing, tx signing)
 */

import { Box, Spinner } from '@chakra-ui/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getAccounts } from '../api/extension';
import { Messaging } from '../api/messaging';
import { AnalyticsProvider } from '../features/analytics/provider';
import { EventTracker } from '../features/analytics/event-tracker';
import { ExtensionViews } from '../features/analytics/types';

import { METHOD, POPUP } from '../config/config';
import Enable from './app/pages/enable';
import NoWallet from './app/pages/noWallet';
import SignData from './app/pages/signData';
import SignTx from './app/pages/signTx';
import Main from './index';

const App = () => {
  const controller = Messaging.createInternalController();
  const navigate = useNavigate();
  const [request, setRequest] = React.useState(null);

  const init = async () => {
    const request = await controller.requestData();
    const hasWallet = await getAccounts();
    setRequest(request);
    if (!hasWallet) navigate('/noWallet');
    else if (request.method === METHOD.enable) navigate('/enable');
    else if (request.method === METHOD.signData) navigate('/signData');
    else if (request.method === METHOD.signTx) navigate('/signTx');
  };

  React.useEffect(() => {
    init();
  }, []);

  return !request ? (
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
          path="/signData"
          element={<SignData request={request} controller={controller} />}
        />
        <Route
          path="/signTx"
          element={<SignTx request={request} controller={controller} />}
        />
        <Route
          path="/enable"
          element={<Enable request={request} controller={controller} />}
        />
        <Route path="/noWallet" element={<NoWallet />} />
      </Routes>
    </div>
  );
};

const root = createRoot(window.document.querySelector(`#${POPUP.internal}`));
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
