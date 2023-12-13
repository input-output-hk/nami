import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
  Image,
  Text,
  Box,
  Link,
} from '@chakra-ui/react';

import LogoWhite from '../../../assets/img/logoWhite.svg';
import LogoBlack from '../../../assets/img/logo.svg';
import IOHK from '../../../assets/img/iohk.svg';
import TermsOfUse from './termsOfUse';
import PrivacyPolicy from './privacyPolicy';

const { version } = require('../../../../package.json');

const About = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const Logo = useColorModeValue(LogoBlack, LogoWhite);

  const termsRef = React.useRef();
  const privacyPolRef = React.useRef();

  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
    closeModal() {
      onClose();
    },
  }));
  return (
    <>
      <Modal size="xs" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">About</ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Image
              cursor="pointer"
              onClick={() => window.open('https://namiwallet.io')}
              width="90px"
              src={Logo}
            />
            <Box height="4" />
            <Text fontSize="sm">{version}</Text>
            <Box height="6" />
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Text fontSize="xs">
                Maintained by{' '}
                <span
                  onClick={() => window.open('https://pipool.online')}
                  style={{ textDecoration: 'underline', cursor: 'pointer' }}
                >
                  IOG
                </span>
              </Text>
              <Box height="4" />
              <Image
                cursor="pointer"
                onClick={() => window.open('https://pipool.online')}
                src={IOHK}
                width="53px"
              />
            </Box>
            <Box height="4" />
            {/* Footer */}
            <Box>
              <Link
                onClick={() => termsRef.current.openModal()}
                color="GrayText"
              >
                Terms of use
              </Link>
              <span>{' '}|{' '}</span>
              <Link
                onClick={() => privacyPolRef.current.openModal()}
                color="GrayText"
              >
                Privacy Policy
              </Link>
            </Box>
            <Box height="2" />
          </ModalBody>
        </ModalContent>
      </Modal>
      <TermsOfUse ref={termsRef} />
      <PrivacyPolicy ref={privacyPolRef} />
    </>
  );
});

export default About;
