import React from 'react';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { flash } from 'react-animations';
import styled, { keyframes } from 'styled-components';
import {
  Link,
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/hooks';

export const BalanceWarning = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const animation = keyframes`${flash}`;
  const StyleButton = styled.button`
    animation: 2s ${animation};
    animation-iteration-count: 2;
  `;
  return (
    <>
      <StyleButton onClick={onOpen}>
        <WarningTwoIcon w={6} h={6} color="orange.500" mr="5px" />
      </StyleButton>
      <Modal
        size="xs"
        isCentered
        autoFocus={false}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <WarningTwoIcon w={6} h={6} color="orange.500" mr="5px" />
            Compatibility Warning
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="semibold" mb="10px">
              We have detected that the current wallet seed has been used with
              another wallet.
            </Text>
            <Text mb="10px">
              To remove this warning and prevent any issue using{' '}
              <strong>Nami Wallet</strong>, consider the following options:
            </Text>
            <UnorderedList mb="20px">
              <ListItem pb="10px">
                Internal transfer of your complete balance from your usual
                wallet to your <strong>Nami Wallet</strong> receive address.
              </ListItem>
              <ListItem>
                Creating a brand new wallet that will be used only with this
                wallet.
              </ListItem>
            </UnorderedList>
            <Text fontWeight="medium" textAlign="center" mb="20px">
              Visit{' '}
              <Link href="https://namiwallet.io/" target="_blank" color="teal">
                namiwallet.io
              </Link>{' '}
              for more details.
            </Text>
            <Box textAlign="center" mb="20px">
              <Button size="sm" colorScheme="teal" onClick={onClose}>
                Got it!
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
