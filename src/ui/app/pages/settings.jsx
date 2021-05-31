import { Button } from '@chakra-ui/button';
import { Select } from '@chakra-ui/select';
import React from 'react';
import { switchNetwork } from '../../../api/extension';

const Settings = () => {
  return (
    <Button
      onClick={() => {
        switchNetwork();
      }}
    >
      Switch Network
    </Button>
  );
};

export default Settings;
