import React from 'react';
import { POPUP_WINDOW } from '../config/config';
import { Scrollbars } from 'react-custom-scrollbars';
import './app/components/styles.css';
import Theme from './theme';
import StoreProvider from './store';

const Main = ({ children }) => {
  React.useEffect(() => {
    window.document.body.addEventListener(
      'keydown',
      (e) => e.key === 'Escape' && e.preventDefault()
    );
    const width = POPUP_WINDOW.width + (window.outerWidth - window.innerWidth);
    const height =
      POPUP_WINDOW.height + (window.outerHeight - window.innerHeight);
    window.resizeTo(width, height);
  }, []);
  return (
    <Theme>
      <StoreProvider>
        <Scrollbars
          style={{ width: POPUP_WINDOW.width, height: POPUP_WINDOW.height }}
          autoHide
        >
          {children}
        </Scrollbars>
      </StoreProvider>
    </Theme>
  );
};

export default Main;
