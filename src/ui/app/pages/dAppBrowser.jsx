import React from 'react';
import { Box, IconButton } from "@chakra-ui/react";
import Account from '../components/account';
import { ChevronLeftIcon, RepeatIcon } from '@chakra-ui/icons';
import { useHistory } from 'react-router-dom';
import { Messaging } from '../../../api/messaging';

const DAppBrowser = () => {
  const history = useHistory();
  const accountRef = React.useRef();

  React.useEffect(() => {
    const modalId = 'internalPopupModal';
    let div = document.createElement('div');
    div.id = modalId;
    document.body.prepend(div);

    const iframe = document.getElementById("dAppBrowser");
    iframe.onload = () => {
      window.addEventListener('message', Messaging.handleMessageFromBrowser);
    };

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
          onClick={() => history.goBack()}
          variant="ghost"
          icon={<ChevronLeftIcon boxSize="7" />}
        />
        caart.store
        <IconButton
          rounded="md"
          variant="ghost"
          icon={<RepeatIcon boxSize="5" />}
        />
      </Box>
      <iframe
        id="dAppBrowser"
        style={{ width: "100%", height: "calc(100vh - 140px)", backgroundColor: "white" }}
        src="http://localhost:3000/mint"
        title="caart.store"
      />
    </Box>
  );
};

export default DAppBrowser;
