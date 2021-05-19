import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import { POPUP } from '../config/config';
import Theme from './theme';
import { Spinner } from '@chakra-ui/spinner';
import Welcome from './app/pages/welcome';
import Wallet from './app/pages/wallet';
import { getAccounts } from '../api/extension';

const App = () => {
  const history = useHistory();
  const [loading, setLoading] = React.useState(true);
  const init = async () => {
    const hasWallet = await getAccounts();
    setLoading(false);
    if (hasWallet) history.push('wallet');
    else history.push('/welcome');
  };
  React.useEffect(() => {
    init();
  }, []);

  return loading ? (
    <div
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Spinner color="teal" size="lg" speed="0.5s" />
    </div>
  ) : (
    <div>
      <Switch>
        <Route exact path="/wallet">
          <Wallet />
        </Route>
        <Route exact path="/welcome">
          <Welcome />
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
  window.document.querySelector(`#${POPUP.main}`)
);

if (module.hot) module.hot.accept();
