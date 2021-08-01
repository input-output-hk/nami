import React from 'react';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { POPUP_WINDOW } from '../config/config';
import { Scrollbars } from 'react-custom-scrollbars';

import './app/components/styles.css';
import SettingsProvider from './app/components/settingsProvider';

import '@fontsource/ubuntu/latin.css';
import 'focus-visible/dist/focus-visible';

const colorMode = localStorage['chakra-ui-color-mode'];

const inputSizes = {
  sm: {
    borderRadius: 'lg',
  },
  md: {
    borderRadius: 'lg',
  },
};

const Input = {
  sizes: {
    sm: {
      field: inputSizes.sm,
      addon: inputSizes.sm,
    },
    md: {
      field: inputSizes.md,
      addon: inputSizes.md,
    },
  },
  defaultProps: {
    focusBorderColor: 'teal.400',
  },
};

const Checkbox = {
  defaultProps: {
    colorScheme: 'teal',
  },
};

const Select = {
  defaultProps: {
    focusBorderColor: 'teal.400',
  },
};

const Button = {
  baseStyle: {
    borderRadius: 'lg',
  },
};

const Switch = {
  defaultProps: {
    colorScheme: 'teal',
  },
};

const theme = extendTheme({
  components: {
    Checkbox,
    Input,
    Select,
    Button,
    Switch,
  },
  config: {
    useSystemColorMode: colorMode ? false : true,
  },
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
