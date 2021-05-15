import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Popup from './Popup';
import './index.css';
import Start from './Start';

render(
  <Router>
    <div>
      <Start />
      <hr />
      <Switch>
        <Route exact path="/">
          <div>Hallo</div>
        </Route>
        <Route path="/about">
          <Popup />
        </Route>
      </Switch>
    </div>
  </Router>,
  window.document.querySelector('#app-container')
);

if (module.hot) module.hot.accept();
