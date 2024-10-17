import React from 'react';
import { Box, DarkMode, Flex, LightMode } from '@chakra-ui/react';
import Theme from '../src/ui/theme';

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export const decorators = [
  (Story) => {
    return (
      <Theme>
        <Flex>
          <LightMode>
            <Box p="50px">
              <Story />
            </Box>
          </LightMode>
          <DarkMode>
            <Box p="50px" backgroundColor="#2E2E2E">
              <Story />
            </Box>
          </DarkMode>
        </Flex>
      </Theme>
    );
  },
];

export default preview;
