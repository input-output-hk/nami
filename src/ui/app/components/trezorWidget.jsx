import { useDisclosure } from '@chakra-ui/hooks';
import { CloseIcon } from '@chakra-ui/icons';
import { Box } from '@chakra-ui/layout';
import { Modal, ModalContent, ModalOverlay } from '@chakra-ui/modal';
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
      <ModalContent background="transparent" shadow="none">
        <Box
          width="full"
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
            right="70px"
            color="black"
            zIndex={1}
          />
          <Box rounded="3xl" overflow="hidden" background="white">
            <iframe
              src="chrome-extension://ofpgiphffndmmcnflcejdgoiddccffom/Trezor/popup.html"
              id="trezorPopupNami"
              width="360px"
              height="500px"
            />
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
});

export default TrezorWidget;
