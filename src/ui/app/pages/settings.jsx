import { Button } from '@chakra-ui/button';
import { useColorMode } from '@chakra-ui/react';
import { Select } from '@chakra-ui/select';
import React from 'react';
import { switchNetwork } from '../../../api/extension';

const Settings = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <Button
        onClick={() => {
          switchNetwork();
        }}
      >
        Switch Network
      </Button>
      <Button
        onClick={() => {
          toggleColorMode();
        }}
      >
        Switch Theme
      </Button>
    </>
  );
};

export default Settings;
