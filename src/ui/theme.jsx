import React from 'react';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { POPUP_WINDOW } from '../config/config';
import { Scrollbars } from 'react-custom-scrollbars';

import './app/components/styles.css';
import SettingsProvider from './app/components/settingsProvider';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        width: POPUP_WINDOW.width + 'px',
        height: POPUP_WINDOW.height + 'px',
        overflow: 'hidden',
      },
    },
  },
  fonts: {
    body: 'Ubuntu, sans-serif',
  },
});

const Theme = (props) => {
  React.useEffect(() => {
    const width = POPUP_WINDOW.width + (window.outerWidth - window.innerWidth);
    const height =
      POPUP_WINDOW.height + (window.outerHeight - window.innerHeight);
    window.resizeTo(width, height);
  }, []);
  return (
    <ChakraProvider theme={theme}>
      <SettingsProvider>
        <Scrollbars
          style={{ width: POPUP_WINDOW.width, height: POPUP_WINDOW.height }}
          autoHide
        >
          {props.children}
        </Scrollbars>
      </SettingsProvider>
    </ChakraProvider>
  );
};

export default Theme;
