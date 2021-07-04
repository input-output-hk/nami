import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import {
  getCurrency,
  getNetwork,
  setCurrency,
  setNetwork,
} from '../../../api/extension';
import { NETWORK_ID, NODE } from '../../../config/config';

const SettingsContext = React.createContext(null);

const SettingsProvider = ({ children }) => {
  const [settings, setS] = React.useState(null);

  const setSettings = (settings) => {
    setCurrency(settings.currency);
    setNetwork(settings.network);
    setS({
      ...settings,
      adaSymbol: settings.network.id === NETWORK_ID.mainnet ? '₳' : 't₳',
    });
  };

  const getSettings = async () => {
    const currency = await getCurrency();
    const network = await getNetwork();
    setS({
      currency: currency || 'usd',
      network: network || { id: NETWORK_ID.mainnet, node: NODE.mainnet },
      adaSymbol: network
        ? network.id === NETWORK_ID.mainnet
          ? '₳'
          : 't₳'
        : '₳',
    });
  };

  React.useEffect(() => {
    getSettings();
  }, []);

  return (
    <>
      <SettingsContext.Provider value={{ settings, setSettings }}>
        {children}
      </SettingsContext.Provider>
      {settings && settings.network.id === NETWORK_ID.testnet && (
        <Box
          position="absolute"
          left="3"
          bottom="3"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="semibold"
          color="orange.400"
        >
          <InfoOutlineIcon />
          <Box width="1" />
          <Text>Testnet</Text>
        </Box>
      )}
    </>
  );
};

export const useSettings = () => React.useContext(SettingsContext);

export default SettingsProvider;
