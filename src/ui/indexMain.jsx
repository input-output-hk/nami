import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Backpack } from 'react-kawaii';
import { useHistory } from 'react-router-dom';

import { POPUP, STORAGE } from '../config/config';
import Theme from './theme';
import { Button } from '@chakra-ui/button';
import { Spinner } from '@chakra-ui/spinner';
import { createWallet } from '../api/extension';

const TEST_PHRASE =
  'grab level comic recipe speak paddle lift air try concert include asset exhibit refuse index sense noble erupt water trial require frame pistol account';

const App = () => {
  const history = useHistory();
  const [data, setData] = React.useState(null);
  const [payment, setPayment] = React.useState('');
  const init = async () => {
    setTimeout(() => {
      history.push('/welcome');
      setData(true);
    }, 2000);
  };
  React.useEffect(() => {
    init();
  }, []);

  return !data ? (
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
        <Route exact path="/">
          <div>Hallo</div>
        </Route>
        <Route exact path="/welcome">
          <div
            style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Backpack size={200} mood="blissful" color="#61DDBC" />
            <div style={{ height: 40 }} />
            <Button
              onClick={async () => {
                await createWallet(TEST_PHRASE, 'cool');
                chrome.storage.local.get(STORAGE.accounts, (store) =>
                  setPayment(store[STORAGE.accounts][0].paymentAddr)
                );
              }}
              colorScheme="teal"
              size="md"
            >
              New Wallet
            </Button>
            <div style={{ height: 10 }} />
            <Button colorScheme="orange" size="md">
              Import
            </Button>
            <div>Your address: {payment}</div>
          </div>
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
