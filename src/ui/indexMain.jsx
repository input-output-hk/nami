/**
 * indexMain is the entry point for the extension panel you open at the top right in the browser
 */

import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { POPUP } from '../config/config';
import Main from './index';
import { Spinner } from '@chakra-ui/spinner';
import Welcome from './app/pages/welcome';
import Wallet from './app/pages/wallet';
import { getAccounts } from '../api/extension';
import { Box } from '@chakra-ui/layout';
import Settings from './app/pages/settings';
import Send from './app/pages/send';
import { useStoreActions, useStoreState } from 'easy-peasy';

const App = () => {
  const route = useStoreState((state) => state.globalModel.routeStore.route);
  const setRoute = useStoreActions(
    (actions) => actions.globalModel.routeStore.setRoute
  );
  const history = useHistory();
  const [isLoading, setIsLoading] = React.useState(true);
  const init = async () => {
    const hasWallet = await getAccounts();
    if (hasWallet) {
      history.push('/wallet');
      // Set route from localStorage if available
      if (route && route !== '/wallet') {
        route
          .slice(1)
          .split('/')
          .reduce((acc, r) => {
            const fullRoute = acc + `/${r}`;
            history.push(fullRoute);
            return fullRoute;
          }, '');
      }
    } else history.push('/welcome');
    setIsLoading(false);
  };
  React.useEffect(() => {
    init();
    history.listen(() => {
      setRoute(history.location.pathname);
    });
  }, []);

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
      <Switch>
        <Route exact path="/wallet">
          <Wallet />
        </Route>
        <Route exact path="/welcome">
          <Welcome />
        </Route>
        <Route path="/settings">
          <Settings />
        </Route>
        <Route exact path="/send">
          <Send />
        </Route>
      </Switch>
    </div>
  );
};

render(
  <Main>
    <Router>
      <App />
    </Router>
  </Main>,
  window.document.querySelector(`#${POPUP.main}`)
);

if (module.hot) module.hot.accept();
