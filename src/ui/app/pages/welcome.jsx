import React from 'react';
import { Backpack } from 'react-kawaii';
import { Checkbox, Image, useColorModeValue } from '@chakra-ui/react';
import {
  Box,
  Button,
  Spacer,
  Text,
  Link,
  Select,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import BannerWhite from '../../../assets/img/bannerWhite.svg';
import BannerBlack from '../../../assets/img/bannerBlack.svg';
import TermsOfUse from '../components/termsOfUse';
import PrivacyPolicy from '../components/privacyPolicy';
import { ViewIcon, WarningTwoIcon } from '@chakra-ui/icons';
import { createTab } from '../../../api/extension';
import { TAB } from '../../../config/config';
import { useCaptureEvent } from '../../../features/analytics/hooks';
import { Events } from '../../../features/analytics/events';
import { useAcceptDocs } from '../../../features/terms-and-privacy/hooks';

const Welcome = () => {
  const capture = useCaptureEvent();
  const Banner = useColorModeValue(BannerBlack, BannerWhite);
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
        position="relative"
      >
        {/* Header */}
        <Box position="absolute" top="9">
          <Image draggable={false} width="85px" src={Banner} />
        </Box>
        {/* Footer */}
        <Box position="absolute" bottom="3" fontSize="xs">
          <Link
            onClick={() => window.open('https://namiwallet.io')}
            color="GrayText"
          >
            namiwallet.io
          </Link>
        </Box>
        <Box h="12" />
        <Text fontWeight="medium" fontSize="3xl">
          Welcome
        </Text>
        <Text
          color="grey"
          fontWeight="light"
          fontSize="sm"
          textAlign="center"
          lineHeight="1.2"
        >
          Let's get started with creating a wallet.
        </Text>
        <Box h="8" />
        <Backpack size={120} mood="blissful" color="#61DDBC" />
        <Box height="8" />
        <Button
          display="inline-flex"
          onClick={() => {
            capture(Events.OnboardingCreateClick);
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
            capture(Events.OnboardingRestoreClick);
            refImport.current.openModal();
          }}
          colorScheme="orange"
          size="sm"
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
  const { accepted, setAccepted } = useAcceptDocs();

  const termsRef = React.useRef();
  const privacyPolicyRef = React.useRef();

  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
  }));
  return (
    <>
      <Modal
        size="xs"
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">Create a wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm">
              Make sure no one is watching the screen, while the seed phrase is
              visible. <ViewIcon />
            </Text>
            <Box h="4" />
            <Box display="flex" alignItems="center" justifyContent="center">
              <Checkbox onChange={(e) => setAccepted(e.target.checked)} />
              <Box w="2" />
              <Text fontWeight={600}>
                I read and accepted the{' '}
                <Link
                  onClick={() => termsRef.current.openModal()}
                  textDecoration="underline"
                >
                  Terms of use
                </Link>
                <span> and </span>
                <Link
                  onClick={() => privacyPolicyRef.current.openModal()}
                  textDecoration="underline"
                >
                  Privacy Policy
                </Link>
              </Text>
              <Box h="2" />
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              isDisabled={!accepted}
              colorScheme="teal"
              onClick={() => createTab(TAB.createWallet, `?type=generate`)}
            >
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <TermsOfUse ref={termsRef} />
      <PrivacyPolicy ref={privacyPolicyRef} />
    </>
  );
});

const ImportModal = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { accepted, setAccepted } = useAcceptDocs();
  const [selected, setSelected] = React.useState(null);

  const termsRef = React.useRef();
  const privacyPolicyRef = React.useRef();

  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
  }));
  return (
    <>
      <Modal
        size="xs"
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">Import a wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" fontWeight="bold">
              <WarningTwoIcon mr="1" />
              Importing Daedalus or Yoroi
            </Text>
            <Spacer height="1" />
            <Text fontSize="13px">
              We always recommend creating a new wallet, as Nami is best
              experienced when not simultaneously used with Yoroi/Daedalus. Nami
              will not track all addresses associated with your imported wallet,
              and might result in partial reflection of assets. To accurately
              reflect your balance, please transfer all assets into your new
              Nami wallet.{' '}
              <Link
                textDecoration="underline"
                onClick={() => window.open('https://namiwallet.io')}
              >
                More info
              </Link>
            </Text>
            <Spacer height="4" />
            <Text fontSize="sm">
              Make sure no one is watching the screen, while the seed phrase is
              visible. <ViewIcon />
            </Text>
            <Spacer height="6" />
            <Select
              size="sm"
              rounded="md"
              onChange={(e) => setSelected(e.target.value)}
              placeholder="Choose seed phrase length"
            >
              <option value="15">15-word seed phrase</option>
              <option value="24">24-word seed phrase</option>
            </Select>
            <Box h="5" />
            <Box display="flex" alignItems="center" justifyContent="center">
              <Checkbox onChange={(e) => setAccepted(e.target.checked)} />
              <Box w="2" />
              <Text fontWeight={600}>
                I read and accepted the{' '}
                <Link
                  onClick={() => termsRef.current.openModal()}
                  textDecoration="underline"
                >
                  Terms of use
                </Link>
                <span> and </span>
                <Link
                  onClick={() => privacyPolicyRef.current.openModal()}
                  textDecoration="underline"
                >
                  Privacy Policy
                </Link>
              </Text>
              <Box h="2" />
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              isDisabled={!selected || !accepted}
              colorScheme="teal"
              onClick={() =>
                createTab(
                  TAB.createWallet,
                  `?type=import&length=${parseInt(selected)}`
                )
              }
            >
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <TermsOfUse ref={termsRef} />
      <PrivacyPolicy ref={privacyPolicyRef} />
    </>
  );
});

export default Welcome;
