import { Spinner } from '@chakra-ui/spinner';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { Messaging } from '../api/messaging';

import { METHOD, POPUP, ROUTE } from '../config/config';
import Enable from './app/pages/enable';
import SignData from './app/pages/signData';
import Theme from './theme';

const App = () => {
  const controller = Messaging.createInternalController();
  const history = useHistory();
  const [response, setResponse] = React.useState(null);

  const init = async () => {
    const resp = await controller.requestData();
    setResponse(resp);
    if (resp.method === METHOD.enable) history.push(ROUTE.enable);
    else if (resp.method === METHOD.signData) history.push(ROUTE.signData);
  };

  React.useEffect(() => {
    init();
  }, []);

  return !response ? (
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
        <Route exact path={ROUTE.signData}>
          <SignData request={response} controller={controller} />
        </Route>
        <Route exact path={ROUTE.enable}>
          <Enable request={response} controller={controller} />
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
