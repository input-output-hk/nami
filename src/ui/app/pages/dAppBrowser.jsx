import React from 'react';
import { Box, IconButton, Image, SkeletonCircle, Spinner, Text } from "@chakra-ui/react";
import Account from '../components/account';
import { ChevronLeftIcon, ExternalLinkIcon, RepeatIcon } from '@chakra-ui/icons';
import { useHistory } from 'react-router-dom';
import useAppDetails from '../hooks/useAppDetails';
import { initConnection } from '../../../pages/Content/bridge';
import { Stack } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { Input } from '@chakra-ui/input';
import { getWhitelisted } from '../../../api/extension';

const DAppBrowser = () => {
  const history = useHistory();
  const accountRef = React.useRef();

  const [input, setInput] = React.useState('');
  const [validInput, setValidInput] = React.useState(false);
  const [src, setSrc] = React.useState();
  const [dApp, setDApp] = React.useState();
  const app = useAppDetails(dApp);

  const [dApps, setDApps] = React.useState();
  const getDApps = () => {
    setDApps();
    getWhitelisted().then((dApps) => {
      setDApps(dApps.reverse());
    });
  }

  React.useEffect(() => {
    const modalId = 'internalPopupModal';
    let div = document.createElement('div');
    div.id = modalId;
    document.body.prepend(div);

    getDApps();

    return () => {
      disconnectBridge();
      document.body.removeChild(document.getElementById(modalId));
    };
  }, []);

  const getFullUrl = (input = '') => {
    if (!input.match('^(https?|ftp)://')) {
      return 'https://' + input;
    }
    return input;
  }

  const isValidInput = (input = '') => {
    try {
      input = getFullUrl(input);
      const url = new URL(input);
      setValidInput(!!url.protocol.match('^(https?|ftp):$'));
    } catch (e) {
      setValidInput(false);
    }
  }

  const launchDApp = () => {
    const url = new URL(getFullUrl(input));
    setSrc(url.href);
    setDApp(url.origin);
  }

  const disconnectBridge = () => {
    const disconnectHandler = window?.nami?.disconnectHandler;
    if (typeof disconnectHandler === "function") {
      disconnectHandler();
    }
  }

  const connectBridge = (evt) => {
    disconnectBridge();
    initConnection(evt.target, dApp);
  }

  return (
    <Box
      minHeight="100%"
      display="flex"
      alignItems="center"
      flexDirection="column"
      position="relative"
    >
      <Account ref={accountRef} />
      <Box
        pt="24px"
        pb="12px"
        px="6"
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <IconButton
          rounded="md"
          onClick={() => {
            if (dApp) {
              getDApps();
              setDApp();
              setSrc();
            } else {
              history.push('/wallet');
            }
          }}
          variant="ghost"
          icon={<ChevronLeftIcon boxSize="7" />}
        />
        {
          dApp &&
          <>
            <Box display="flex" alignItems="center">
              <Image
                width="24px"
                src={app.icon}
                fallback={<SkeletonCircle width="24px" height="24px" />}
              />
              <Text marginLeft={2}>{app.name}</Text>
            </Box>
            <IconButton
              rounded="md"
              variant="ghost"
              icon={<RepeatIcon boxSize="5" />}
              onClick={() => {
                const url = src;
                setSrc("");
                setTimeout(() => setSrc(url), 50);
              }}
            />
          </>
        }
      </Box>
      {
        dApp && src ?
        <iframe
          id="dAppBrowser"
          style={{ width: "100%", height: "calc(100vh - 140px)", backgroundColor: "white" }}
          src={src}
          title={app.name}
          onLoad={connectBridge}
        /> :
        <Stack
          width="65%"
          direction="column"
          alignItems="center"
        >
          <Stack
            width="100%"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Input
              width="100%"
              variant="filled"
              autoComplete="off"
              value={input}
              spellCheck={false}
              fontSize="xs"
              placeholder="dApp"
              onInput={(e) => {
                const url = e.target.value;
                setInput(url);
                isValidInput(url);
              }}
              onKeyUp={(e) => {
                if (e.key === "Enter" && validInput) {
                  launchDApp();
                }
              }}
            />
            <Button
              isDisabled={!validInput}
              colorScheme="orange"
              onClick={launchDApp}
            >
              Go
            </Button>
          </Stack>

          <Box height="10" />
          <Text fontSize="lg" fontWeight="bold">
            Recent dApps
          </Text>
          <Box height="6" />
          {dApps ? (
            dApps.length > 0 ? (
              dApps.map((origin) => (
                <DApp
                  key={origin}
                  origin={origin}
                  onClick={() => {
                    setSrc(origin);
                    setDApp(origin);
                  }}
                />
              ))
            ) : (
              <Box
                mt="50"
                width="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="GrayText"
              >
                No Recent dApps
              </Box>
            )
          ) : (
            <Box
              mt="50"
              width="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Spinner color="teal" speed="0.5s" />
            </Box>
          )}

          <Box height="6" />
        </Stack>
      }
    </Box>
  );
};

const DApp = ({ origin, onClick }) => {
  const app = useAppDetails(origin);
  return (
    <Box
      mb="2"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Image
        width="24px"
        src={app.icon}
        fallback={<SkeletonCircle width="24px" height="24px" />}
      />
      <Text>{app.name}</Text>
      <ExternalLinkIcon
        cursor="pointer"
        onClick={onClick}
      />
    </Box>
  );
}

export default DAppBrowser;
