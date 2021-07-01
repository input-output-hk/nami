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

import BannerWhite from '../../../assets/img/bannerWhite.svg';
import BannerBlack from '../../../assets/img/bannerBlack.svg';
import Berry from '../../../assets/img/berry.svg';
import TermsOfUse from './termsOfUse';

const { version } = require('../../../../package.json');

const About = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const Banner = useColorModeValue(BannerBlack, BannerWhite);

  const termsRef = React.useRef();

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
              width="120px"
              src={Banner}
            />
            <Box height="2" />
            <Text fontSize="sm">{version}</Text>
            <Box height="4" />
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Text fontSize="xs">
                Created by{' '}
                <span
                  onClick={() => window.open('https://pipool.online')}
                  style={{ textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Berry Pool
                </span>
              </Text>
              <Box height="4" />
              <Image
                cursor="pointer"
                onClick={() => window.open('https://pipool.online')}
                src={Berry}
                width="30px"
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
            </Box>
            <Box height="1" />
          </ModalBody>
        </ModalContent>
      </Modal>
      <TermsOfUse ref={termsRef} />
    </>
  );
});

export default About;
