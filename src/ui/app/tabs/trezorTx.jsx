import React from 'react';
import { TAB } from '../../../config/config';
import Main from '../../index';
import { BrowserRouter as Router } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Box, useColorModeValue, Image, useToast } from '@chakra-ui/react';
import { AnalyticsProvider } from '../../../features/analytics/provider';
import { EventTracker } from '../../../features/analytics/event-tracker';
import { ExtensionViews } from '../../../features/analytics/types';

// assets
import LogoOriginal from '../../../assets/img/logo.svg';
import LogoWhite from '../../../assets/img/logoWhite.svg';
import { getCurrentAccount, indexToHw, initHW } from '../../../api/extension';
import { signAndSubmitHW } from '../../../api/extension/wallet';
import Loader from '../../../api/loader';
import { useStoreActions } from 'easy-peasy';

const App = () => {
  const Logo = useColorModeValue(LogoOriginal, LogoWhite);
  const backgroundColor = useColorModeValue('gray.200', 'inherit');
  const toast = useToast();

  const setRoute = useStoreActions(
    (actions) => actions.globalModel.routeStore.setRoute
  );
  const resetSend = useStoreActions(
    (actions) => actions.globalModel.sendStore.reset
  );

  const init = async () => {
    await Loader.load();

    const account = await getCurrentAccount();
    const params = new URLSearchParams(window.location.search);
    const tx = params.get('tx');
    const hw = indexToHw(account.index);

    const txDes = Loader.Cardano.Transaction.from_bytes(Buffer.from(tx, 'hex'));
    await initHW({ device: hw.device, id: hw.id });
    try {
      await signAndSubmitHW(txDes, {
        keyHashes: [account.paymentKeyHash],
        account,
        hw,
      });
      toast({
        title: 'Transaction submitted',
        status: 'success',
        duration: 3000,
      });
    } catch (_e) {
      toast({
        title: 'Transaction failed',
        status: 'error',
        duration: 3000,
      });
    }
    resetSend();
    setRoute('/wallet');
    setTimeout(() => window.close(), 3000);
  };

  React.useEffect(() => init(), []);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="full"
      height="100vh"
      position="relative"
      background={backgroundColor}
    >
      {/* Logo */}
      <Box position="absolute" left="40px" top="40px">
        <Image draggable={false} src={Logo} width="36px" />
      </Box>

      <Box
        display="flex"
        alignItems="center"
        flexDirection="column"
        fontSize="lg"
      >
        Waiting for Trezor...
      </Box>
    </Box>
  );
};

const root = createRoot(window.document.querySelector(`#${TAB.trezorTx}`));
root.render(
  <AnalyticsProvider view={ExtensionViews.Extended}>
    <EventTracker />
    <Main>
      <Router>
        <App />
      </Router>
    </Main>
  </AnalyticsProvider>
);

if (module.hot) module.hot.accept();
