import { CloseIcon } from '@chakra-ui/icons';
import { Box, Modal, ModalContent, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import React from 'react';

const TrezorWidget = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
    closeModal() {
      onClose();
    },
  }));
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        background="transparent"
        shadow="none"
        m={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="full"
      >
        <Box
          width="370px"
          height="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          <CloseIcon
            cursor="pointer"
            onClick={onClose}
            position="absolute"
            top="20px"
            right="30px"
            color="black"
            zIndex={1}
          />
          <Box rounded="3xl" overflow="hidden" background="white">
            <iframe
              src={chrome.runtime.getURL('Trezor/popup.html')}
              id="trezorPopupNami"
              width="360px"
              height="560px"
            />
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
});

export default TrezorWidget;
