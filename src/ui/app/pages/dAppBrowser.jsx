import React from 'react';
import { Box, IconButton, Image, SkeletonCircle, Text } from "@chakra-ui/react";
import Account from '../components/account';
import { ChevronLeftIcon, RepeatIcon } from '@chakra-ui/icons';
import { useHistory } from 'react-router-dom';
import { Messaging } from '../../../api/messaging';
import useAppDetails from '../hooks/useAppDetails';

const DAppBrowser = () => {
  const history = useHistory();
  const accountRef = React.useRef();

  const dApp = 'https://caart.store';
  const app = useAppDetails(dApp);

  React.useEffect(() => {
    const modalId = 'internalPopupModal';
    let div = document.createElement('div');
    div.id = modalId;
    document.body.prepend(div);

    window.addEventListener('message', Messaging.handleMessageFromBrowser);

    return () => {
      document.body.removeChild(document.getElementById(modalId));
      window.removeEventListener('message', Messaging.handleMessageFromBrowser);
    };
  }, []);

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
        px="6px"
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <IconButton
          rounded="md"
          onClick={() => history.push('/wallet')}
          variant="ghost"
          icon={<ChevronLeftIcon boxSize="7" />}
        />
        <Box display="flex" alignItems="center">
          <Image
            mr="8px"
            width="24px"
            src={app.icon}
            fallback={<SkeletonCircle width="24px" height="24px" />}
          />
          <Text>{app.name}</Text>
        </Box>
        <IconButton
          rounded="md"
          variant="ghost"
          icon={<RepeatIcon boxSize="5" />}
        />
      </Box>
      <iframe
        id="dAppBrowser"
        style={{ width: "100%", height: "calc(100vh - 140px)", backgroundColor: "white" }}
        src={dApp}
        title={app.name}
      />
    </Box>
  );
};

export default DAppBrowser;
