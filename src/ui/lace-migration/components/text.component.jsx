import React from 'react';
import { Text as ChakraText, useColorMode } from '@chakra-ui/react';
import { getColor } from './get-color';

export const Text = ({ children, color, ...rest }) => {
  const { colorMode } = useColorMode();
  return (
    <ChakraText {...rest} color={getColor(color, colorMode)}>
      {children}
    </ChakraText>
  );
};
