import { Box } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/spinner';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { getAccounts } from '../api/extension';
import { Messaging } from '../api/messaging';

import { METHOD, POPUP } from '../config/config';
import { useSettings } from './app/components/SettingsProvider';
import Enable from './app/pages/enable';
import NoWallet from './app/pages/noWallet';
import SignData from './app/pages/signData';
import SignTx from './app/pages/signTx';
import Theme from './theme';

const App = () => {
  const controller = Messaging.createInternalController();
  const history = useHistory();
  const { settings } = useSettings();
  const [response, setResponse] = React.useState(null);

  const init = async () => {
    const resp = await controller.requestData();
    const hasWallet = await getAccounts();
    setResponse(resp);
    if (!hasWallet) history.push('/noWallet');
    else if (resp.method === METHOD.enable) history.push('/enable');
    else if (resp.method === METHOD.signData) history.push('/signData');
    else if (resp.method === METHOD.signTx) history.push('/signTx');
  };

  React.useEffect(() => {
    init();
  }, []);

  return !response || !settings ? (
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
      <Switch>
        <Route exact path="/signData">
          <SignData request={response} controller={controller} />
        </Route>
        <Route exact path="/signTx">
          <SignTx request={response} controller={controller} />
        </Route>
        <Route exact path="/enable">
          <Enable request={response} controller={controller} />
        </Route>
        <Route exact path="/noWallet">
          <NoWallet />
        </Route>
      </Switch>
    </div>
  );
};

render(
  <Theme>
    <Router>
      <App />
    </Router>
  </Theme>,
  window.document.querySelector(`#${POPUP.internal}`)
);

if (module.hot) module.hot.accept();
