import { Button } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/hooks';
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input';
import { Text } from '@chakra-ui/layout';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import React from 'react';
import { ERROR } from '../../../config/config';

const ConfirmModal = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [state, setState] = React.useState({
    password: '',
    show: false,
    name: '',
  });

  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
    closeModal() {
      onClose();
    },
  }));

  React.useEffect(() => {
    setState({
      password: '',
      show: false,
      name: '',
    });
  }, [isOpen]);

  return (
    <Modal size="xs" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">
          {props.title ? props.title : 'Confirm with password'}
        </ModalHeader>
        <ModalBody>
          {props.info}
          <InputGroup size="md">
            <Input
              variant="filled"
              isInvalid={state.wrongPassword === true}
              pr="4.5rem"
              type={state.show ? 'text' : 'password'}
              onChange={(e) =>
                setState((s) => ({ ...s, password: e.target.value }))
              }
              placeholder="Enter password"
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                onClick={() => setState((s) => ({ ...s, show: !s.show }))}
              >
                {state.show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
          {state.wrongPassword === true && (
            <Text color="red.300">Password is wrong</Text>
          )}
        </ModalBody>

        <ModalFooter>
          <Button mr={3} variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            isDisabled={!state.password || props.ready === false}
            colorScheme="teal"
            onClick={async () => {
              try {
                const signedMessage = await props.sign(state.password);
                props.onConfirm(true, signedMessage);
              } catch (e) {
                if (e === ERROR.wrongPassword)
                  setState((s) => ({ ...s, wrongPassword: true }));
                else props.onConfirm(false, e);
              }
            }}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default ConfirmModal;
