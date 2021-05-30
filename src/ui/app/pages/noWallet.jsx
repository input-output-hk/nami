import { Button } from '@chakra-ui/button';
import { Box, Text } from '@chakra-ui/layout';
import React from 'react';
import { Backpack } from 'react-kawaii';

const NoWallet = () => {
  return (
    <Box
      height="100vh"
      width="full"
      display="flex"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
      position="relative"
    >
      <Backpack size={140} mood="ko" color="#61DDBC" />
      <Box height="2" />
      <Text fontWeight="bold" color="GrayText">
        No Wallet
      </Text>
      <Box position="absolute" width="full" bottom="16" width="300px">
        <Text textAlign="center" fontSize="sm">
          Open the panel at the top right in order to create a wallet.
        </Text>
      </Box>
    </Box>
  );
};

export default NoWallet;
