import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import { POPUP } from '../config/config';
import Theme from './theme';

const Start = () => {
  const [loading, setLoading] = React.useState(true);
};

const App = () => (
  <div>
    <Switch>
      <Route exact path="/">
        <div>Hallo</div>
      </Route>
    </Switch>
  </div>
);

render(
  <Theme>
    <Router>
      <App />
    </Router>
  </Theme>,
  window.document.querySelector(`#${POPUP.internal}`)
);

if (module.hot) module.hot.accept();
