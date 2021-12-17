/**
 * hw.jsx is the entry point for the harware wallet extension tab
 */

import React from 'react';
import { HW, STORAGE, TAB } from '../../../config/config';
import Main from '../../index';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from 'react-dom';
import {
  Button,
  Box,
  useColorModeValue,
  useColorMode,
  Image,
  Text,
  Checkbox,
  Icon,
} from '@chakra-ui/react';
import { Scrollbars } from 'react-custom-scrollbars';
import { HARDENED } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import TrezorConnect from '../../../../temporary_modules/trezor-connect';

// assets
import LogoOriginal from '../../../assets/img/logo.svg';
import LogoWhite from '../../../assets/img/logoWhite.svg';
import LedgerLogo from '../../../assets/img/ledgerLogo.svg';
import TrezorLogo from '../../../assets/img/trezorLogo.svg';
import { CheckCircleIcon, ChevronRightIcon } from '@chakra-ui/icons';
import TrezorWidget from '../components/trezorWidget';
import {
  createHWAccounts,
  getHwAccounts,
  getStorage,
  indexToHw,
  initHW,
} from '../../../api/extension';
import { MdUsb } from 'react-icons/md';
import { Planet } from 'react-kawaii';

const MANUFACTURER = {
  ledger: 'Ledger',
  trezor: 'SatoshiLabs',
};

const App = () => {
  const Logo = useColorModeValue(LogoOriginal, LogoWhite);
  const cardColor = useColorModeValue('white', 'gray.900');
  const backgroundColor = useColorModeValue('gray.200', 'inherit');
  const [tab, setTab] = React.useState(0);
  const data = React.useRef({ device: '', id: '' });

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="full"
      height="100vh"
      position="relative"
      background={backgroundColor}
    >
      {/* Logo */}
      <Box position="absolute" left="40px" top="40px">
        <Image draggable={false} src={Logo} width="36px" />
      </Box>

      <Box
        rounded="2xl"
        shadow="md"
        display="flex"
        alignItems="center"
        flexDirection="column"
        width="90%"
        maxWidth="460px"
        maxHeight="550px"
        height="70vh"
        p={10}
        background={cardColor}
        fontSize="sm"
      >
        {tab === 0 && (
          <ConnectHW
            onConfirm={({ device, id }) => {
              data.current = { device, id };
              setTab(1);
            }}
          />
        )}
        {tab === 1 && (
          <SelectAccounts data={data.current} onConfirm={() => setTab(2)} />
        )}
        {tab === 2 && <SuccessAndClose />}
      </Box>
    </Box>
  );
};

const ConnectHW = ({ onConfirm }) => {
  const { colorMode } = useColorMode();
  const [selected, setSelected] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  return (
    <>
      <Text fontSize="x-large" fontWeight="semibold">
        Connect Hardware Wallet
      </Text>
      <Box h={6} />
      <Text width="300px">
        Choose the hardware wallet you would like to use with Nami.
      </Text>
      <Box h={8} />
      <Box display="flex" alignItems="center" justifyContent="center">
        <Box
          cursor="pointer"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="120px"
          height="55px"
          border="solid 1px"
          rounded="xl"
          borderColor={selected === HW.trezor && 'teal.400'}
          borderWidth={selected === HW.trezor && '3px'}
          p={4}
          _hover={{ opacity: 0.8 }}
          onClick={() => setSelected(HW.trezor)}
        >
          <Image
            draggable={false}
            src={TrezorLogo}
            filter={colorMode == 'dark' && 'invert(1)'}
          />
        </Box>
        <Box w={5} />
        <Box
          cursor="pointer"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="120px"
          height="55px"
          border="solid 1px"
          rounded="xl"
          borderColor={selected === HW.ledger && 'teal.400'}
          borderWidth={selected === HW.ledger && '3px'}
          p={1}
          _hover={{ opacity: 0.8 }}
          onClick={() => setSelected(HW.ledger)}
        >
          <Image
            draggable={false}
            src={LedgerLogo}
            filter={colorMode == 'dark' && 'invert(1)'}
          />
        </Box>
      </Box>
      <Box h={10} />
      {selected === HW.trezor && (
        <Text width="300px">
          Connect your <b>Trezor</b> device directly to your computer. Unlock
          the device and then click Continue.
        </Text>
      )}
      {selected === HW.ledger && (
        <Text width="300px">
          Connect your <b>Ledger</b> device directly to your computer. Unlock
          the device and open the Cardano app. Then click Continue.
        </Text>
      )}
      {selected && <Icon as={MdUsb} boxSize={7} mt="6" />}
      <Button
        isDisabled={isLoading || !selected}
        isLoading={isLoading}
        mt="auto"
        rightIcon={<ChevronRightIcon />}
        onClick={async () => {
          setIsLoading(true);
          setError('');
          try {
            const device = await navigator.usb.requestDevice({
              filters: [],
            });
            if (device.manufacturerName !== MANUFACTURER[selected]) {
              setError(
                `Device is not a ${selected == HW.ledger ? 'Ledger' : 'Trezor'}`
              );
              setIsLoading(false);
              return;
            }
            if (selected === HW.ledger) {
              try {
                await initHW({ device: selected, id: device.productId });
              } catch (e) {
                setError('Cardano app not opened');
                setIsLoading(false);
                return;
              }
            }

            return onConfirm({ device: selected, id: device.productId });
          } catch (e) {
            setError('Device not found');
          }

          setIsLoading(false);
        }}
      >
        Continue
      </Button>

      {error && (
        <Text mt={3} fontSize="xs" color="red.300">
          {error}
        </Text>
      )}
    </>
  );
};

const SelectAccounts = ({ data, onConfirm }) => {
  const [selected, setSelected] = React.useState({ 0: true });
  const [error, setError] = React.useState('');
  const trezorRef = React.useRef();
  const [existing, setExisting] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInit, setIsInit] = React.useState(false);

  const getExistingAccounts = async () => {
    const accounts = await getStorage(STORAGE.accounts);
    const hwAccounts = getHwAccounts(accounts, {
      device: data.device,
      id: data.id,
    });
    const existing = {};
    Object.keys(hwAccounts).forEach(
      (accountIndex) => (existing[indexToHw(accountIndex).account] = true)
    );
    setExisting(existing);
    setIsInit(true);
  };
  React.useEffect(() => {
    getExistingAccounts();
  }, []);

  return (
    isInit && (
      <>
        <Text fontSize="x-large" fontWeight="semibold">
          Select Accounts
        </Text>
        <Box h={6} />
        <Text width="300px">
          Select the accounts you would like to import. Afterwards click
          Continue and follow the instructions on your device.
        </Text>
        <Box h={8} />

        <Box width="80%" height="50%" rounded="md" border="solid 1px">
          <Scrollbars
            style={{
              width: '100%',
              height: '100%',
            }}
            autoHide
          >
            {Object.keys([...Array(50)]).map((accountIndex) => (
              <Box
                key={accountIndex}
                opacity={existing[accountIndex] && 0.7}
                width="80%"
                my={4}
                display="flex"
                alignItems="center"
              >
                <Box ml={6} fontWeight="bold">
                  {' '}
                  Account {parseInt(accountIndex) + 1}{' '}
                  {accountIndex == 0 && ' - Default'}
                </Box>
                <Checkbox
                  isDisabled={existing[accountIndex]}
                  isChecked={selected[accountIndex] && !existing[accountIndex]}
                  onChange={(e) =>
                    setSelected((s) => ({
                      ...s,
                      [accountIndex]: e.target.checked,
                    }))
                  }
                  ml="auto"
                />
              </Box>
            ))}
          </Scrollbars>
        </Box>
        <Button
          isDisabled={
            isLoading ||
            Object.keys(selected).filter((s) => selected[s] && !existing[s])
              .length <= 0
          }
          isLoading={isLoading}
          mt="auto"
          rightIcon={<ChevronRightIcon />}
          onClick={async () => {
            setIsLoading(true);
            setError('');
            const accountIndexes = Object.keys(selected).filter(
              (s) => selected[s] && !existing[s]
            );
            try {
              const { device, id } = data;
              let accounts;
              if (device === HW.ledger) {
                const appAda = await initHW({ device, id });
                const ledgerKeys = await appAda.getExtendedPublicKeys({
                  paths: accountIndexes.map((index) => [
                    HARDENED + 1852,
                    HARDENED + 1815,
                    HARDENED + parseInt(index),
                  ]),
                });
                accounts = ledgerKeys.map(
                  ({ publicKeyHex, chainCodeHex }, index) => ({
                    accountIndex: `${HW.ledger}-${id}-${accountIndexes[index]}`,
                    publicKey: publicKeyHex + chainCodeHex,
                    name: `Ledger ${parseInt(accountIndexes[index]) + 1}`,
                  })
                );
              } else if (device == HW.trezor) {
                await initHW({ device });
                trezorRef.current.openModal();
                const trezorKeys = await TrezorConnect.cardanoGetPublicKey({
                  bundle: accountIndexes.map((index) => ({
                    path: `m/1852'/1815'/${parseInt(index)}'`,
                    showOnTrezor: false,
                  })),
                });
                if (trezorKeys.success == false) {
                  trezorRef.current.closeModal();
                }
                accounts = trezorKeys.payload.map(({ publicKey }, index) => ({
                  accountIndex: `${HW.trezor}-${id}-${accountIndexes[index]}`,
                  publicKey,
                  name: `Trezor ${parseInt(accountIndexes[index]) + 1}`,
                }));
                trezorRef.current.closeModal();
              }
              await createHWAccounts(accounts);
              return onConfirm();
            } catch (e) {
              console.log(e);
              setError('An error occured');
            }

            setIsLoading(false);
          }}
        >
          Continue
        </Button>
        {error && (
          <Text mt={3} fontSize="xs" color="red.300">
            {error}
          </Text>
        )}
        <TrezorWidget ref={trezorRef} />
      </>
    )
  );
};

const SuccessAndClose = () => {
  return (
    <>
      <Text
        mt={10}
        fontSize="x-large"
        fontWeight="semibold"
        width={200}
        textAlign="center"
      >
        Successfully added accounts!
      </Text>
      <Box h={6} />
      <Planet mood="blissful" size={150} color="#61DDBC" />
      <Box h={10} />
      <Text width="300px">
        You can now close this tab and continue with the extension.
      </Text>
      <Button mt="auto" onClick={async () => window.close()}>
        Close
      </Button>
    </>
  );
};

render(
  <Main>
    <Router>
      <App />
    </Router>
  </Main>,
  window.document.querySelector(`#${TAB.hw}`)
);

if (module.hot) module.hot.accept();
