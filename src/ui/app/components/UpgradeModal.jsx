import React from 'react';
import { IoRocketSharp } from 'react-icons/io5';
import {
  Icon,
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
  Heading,
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/hooks';

export const UpgradeModal = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
  }));

  return (
    <Modal
      size="xs"
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      autoFocus={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">
          <Icon as={IoRocketSharp} w={6} h={6} color="cyan.300" mr="10px" />
          What's new in Nami ?
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody fontSize="xs">
          {props.info.map((item) => (
            <Box mb="20px" key={item.version}>
              <Heading
                size="sm"
                mb="15px"
                borderBottom="1px"
                borderColor="white"
                pb="5px"
              >
                Version {item.version}
              </Heading>
              <UnorderedList>
                {item.info.map((info, index) => (
                  <ListItem mb="10px" key={item.version + '_' + index}>
                    <Heading size="xs">{info.title}</Heading>
                    <Text mt="5px">{info.detail}</Text>
                  </ListItem>
                ))}
              </UnorderedList>
            </Box>
          ))}

          <Box textAlign="center" mb="15px">
            <Button colorScheme="teal" onClick={onClose}>
              Got it!
            </Button>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});
