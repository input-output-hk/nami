import React from 'react';
import { Box, IconButton, Image, SkeletonCircle, Text } from "@chakra-ui/react";
import Account from '../components/account';
import { ChevronLeftIcon, RepeatIcon } from '@chakra-ui/icons';
import { useHistory } from 'react-router-dom';
import useAppDetails from '../hooks/useAppDetails';
import { initConnection } from '../../../pages/Content/bridge';

const DAppBrowser = () => {
  const history = useHistory();
  const accountRef = React.useRef();

  const dApp = 'http://localhost:3000';
  const app = useAppDetails(dApp);

  React.useEffect(() => {
    const modalId = 'internalPopupModal';
    let div = document.createElement('div');
    div.id = modalId;
    document.body.prepend(div);

    return () => {
      document.body.removeChild(document.getElementById(modalId));
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
        onLoad={evt => initConnection(evt.target, dApp)}
      />
    </Box>
  );
};

export default DAppBrowser;
