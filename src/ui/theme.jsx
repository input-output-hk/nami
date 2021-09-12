import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { POPUP_WINDOW } from '../config/config';
import './app/components/styles.css';
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
    focusBorderColor: 'teal.500',
  },
};

const Checkbox = {
  defaultProps: {
    colorScheme: 'teal',
  },
};

const Select = {
  defaultProps: {
    focusBorderColor: 'teal.500',
  },
};

const Button = {
  baseStyle: {
    borderRadius: 'lg',
  },
};

const Switch = {
  baseStyle: {
    track: {
      _focus: {
        boxShadow: 'none',
      },
    },
  },
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
        // width: POPUP_WINDOW.width + 'px',
        // height: POPUP_WINDOW.height + 'px',
        overflow: 'hidden',
      },
    },
  },
  fonts: {
    body: 'Ubuntu, sans-serif',
  },
});

const Theme = ({ children }) => {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};

export default Theme;
