import React from 'react';
import { createWallet } from '../../../api/extension';
import { Button } from '@chakra-ui/button';
import { Backpack } from 'react-kawaii';
import { useHistory } from 'react-router-dom';

const TEST_PHRASE =
  'grab level comic recipe speak paddle lift air try concert include asset exhibit refuse index sense noble erupt water trial require frame pistol account';

const Welcome = ({ data }) => {
  const history = useHistory();

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Backpack size={200} mood="blissful" color="#61DDBC" />
      <div style={{ height: 40 }} />
      <Button
        onClick={async () => {
          const result = await createWallet('My wallet', TEST_PHRASE, 'cool');
          if (result === true) history.push('/wallet');
        }}
        colorScheme="teal"
        size="md"
      >
        New Wallet
      </Button>
      <div style={{ height: 10 }} />
      <Button colorScheme="orange" size="md">
        Import
      </Button>
    </div>
  );
};

export default Welcome;
