import React from 'react';
import { POPUP, POPUP_WINDOW, TAB } from '../config/config';
import { Scrollbars } from 'react-custom-scrollbars';
import './app/components/styles.css';
import Theme from './theme';
import StoreProvider from './store';
import { Box } from '@chakra-ui/react';

const isMain = window.document.querySelector(`#${POPUP.main}`);
const isTab = window.document.querySelector(`#${TAB.hw}`);

const Main = ({ children }) => {
  React.useEffect(() => {
    window.document.body.addEventListener(
      'keydown',
      (e) => e.key === 'Escape' && e.preventDefault()
    );
    // Windows is somehow not opening the popup with the right size. Dynamically changing it, fixes it for now:
    if (navigator.userAgent.indexOf('Win') != -1 && !isMain && !isTab) {
      const width =
        POPUP_WINDOW.width + (window.outerWidth - window.innerWidth);
      const height =
        POPUP_WINDOW.height + (window.outerHeight - window.innerHeight);
      window.resizeTo(width, height);
    }
  }, []);
  return (
    <Box
      width={isMain ? POPUP_WINDOW.width + 'px' : '100%'}
      height={isMain ? POPUP_WINDOW.height + 'px' : '100vh'}
    >
      <Theme>
        <StoreProvider>
          <Scrollbars style={{ width: '100vw', height: '100vh' }} autoHide>
            {children}
          </Scrollbars>
        </StoreProvider>
      </Theme>
    </Box>
  );
};

export default Main;
