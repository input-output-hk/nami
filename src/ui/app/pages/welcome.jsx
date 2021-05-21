import React from 'react';
import { createWallet } from '../../../api/extension';
import { Button } from '@chakra-ui/button';
import { Backpack } from 'react-kawaii';
import { useHistory } from 'react-router-dom';
import { ROUTE } from '../../../config/config';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Box } from '@chakra-ui/layout';
import { useDisclosure } from '@chakra-ui/hooks';

const TEST_PHRASE =
  'grab level comic recipe speak paddle lift air try concert include asset exhibit refuse index sense noble erupt water trial require frame pistol account';

const Welcome = ({ data }) => {
  const history = useHistory();
  const refWallet = React.useRef();
  const refImport = React.useRef();

  return (
    <>
      <Box
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Backpack size={200} mood="blissful" color="#61DDBC" />
        <Box height="10" />
        <Button
          onClick={() => {
            refWallet.current.openModal();
          }}
          colorScheme="teal"
          size="md"
        >
          New Wallet
        </Button>
        <Box height="4" />
        <Button
          onClick={() => {
            refImport.current.openModal();
          }}
          colorScheme="orange"
          size="md"
        >
          Import
        </Button>
      </Box>
      <WalletModal ref={refWallet} />
      <ImportModal ref={refImport} />
    </>
  );
};

const WalletModal = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();

  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
  }));
  return (
    <Modal size="sm" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Make sure no one is watching the screen, while the seed phrase is
          visible.
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            colorScheme="teal"
            mr={3}
            onClick={() => history.push('/createWallet/generate')}
          >
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

const ImportModal = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();

  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
  }));
  return (
    <Modal size="sm" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Import a wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Make sure no one is watching the screen, while the seed phrase is
          visible.
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            colorScheme="teal"
            mr={3}
            onClick={() =>
              history.push({
                pathname: '/createWallet/import',
                seedLength: 24,
              })
            }
          >
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default Welcome;
