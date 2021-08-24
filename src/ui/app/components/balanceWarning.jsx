import React from 'react';
import { InfoIcon, InfoOutlineIcon, WarningTwoIcon } from '@chakra-ui/icons';
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
import UnitDisplay from './unitDisplay';

const animation = keyframes`${flash}`;
const StyleButton = styled.button`
  animation: 2s ${animation};
  animation-iteration-count: 2;
`;

export const BalanceWarning = ({ fullBalance, symbol }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <StyleButton onClick={onOpen}>
        <InfoIcon w={6} h={6} color="orange.300" mr="6px" />
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
          <ModalHeader fontSize="md">
            <InfoIcon w={6} h={6} color="orange.300" mr="8px" />
            Compatibility hint
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody fontSize="sm">
            <Text fontWeight="semibold">
              We have detected that the current wallet seed has been used with
              another wallet.
            </Text>
            <Text textAlign="center" fontWeight="bold">
              Real balance
            </Text>
            <Box textAlign="center" mb="10px">
              <UnitDisplay
                color="orange.500"
                fontSize="sm"
                fontWeight="bold"
                quantity={fullBalance}
                decimals={6}
                symbol={symbol}
              />
            </Box>
            <Text mb="5px">
              To remove this warning and prevent any issue using{' '}
              <strong>Nami Wallet</strong>, consider the following options:
            </Text>
            <UnorderedList mb="15px">
              <ListItem pb="10px">
                Internal transfer of your complete balance from your usual
                wallet to your <strong>Nami Wallet</strong> receive address.
              </ListItem>
              <ListItem>
                Creating a brand new wallet that will be used only with this
                wallet.
              </ListItem>
            </UnorderedList>
            <Text fontWeight="medium" textAlign="center" mb="15px">
              Visit{' '}
              <Link href="https://namiwallet.io/" target="_blank" color="teal">
                namiwallet.io
              </Link>{' '}
              for more details.
            </Text>
            <Box textAlign="center" mb="15px">
              <Button colorScheme="teal" onClick={onClose}>
                Got it!
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
