import { Button } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/hooks';
import Icon from '@chakra-ui/icon';
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input';
import { Box, Text } from '@chakra-ui/layout';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import React from 'react';
import { MdUsb } from 'react-icons/md';
import { indexToHw, initHW, isHW } from '../../../api/extension';
import { ERROR, HW } from '../../../config/config';
import TrezorWidget from './trezorWidget';

const ConfirmModal = React.forwardRef(
  ({ ready, onConfirm, sign, onCloseBtn, title, info }, ref) => {
    const {
      isOpen: isOpenNormal,
      onOpen: onOpenNormal,
      onClose: onCloseNormal,
    } = useDisclosure();
    const {
      isOpen: isOpenHW,
      onOpen: onOpenHW,
      onClose: onCloseHW,
    } = useDisclosure();
    const props = {
      ready,
      onConfirm,
      sign,
      onCloseBtn,
      title,
      info,
    };
    const [hw, setHw] = React.useState('');

    React.useImperativeHandle(ref, () => ({
      openModal(accountIndex) {
        if (isHW(accountIndex)) {
          setHw(indexToHw(accountIndex));
          onOpenHW();
        } else {
          onOpenNormal();
        }
      },
      closeModal() {
        onCloseNormal();
        onCloseHW();
      },
    }));

    return (
      <>
        <ConfirmModalHw
          props={props}
          isOpen={isOpenHW}
          onClose={onCloseHW}
          hw={hw}
        />
        <ConfirmModalNormal
          props={props}
          isOpen={isOpenNormal}
          onClose={onCloseNormal}
        />
      </>
    );
  }
);

const ConfirmModalNormal = ({ props, isOpen, onClose }) => {
  const [state, setState] = React.useState({
    password: '',
    show: false,
    name: '',
  });
  const [waitReady, setWaitReady] = React.useState(true);
  const inputRef = React.useRef();

  React.useEffect(() => {
    setState({
      password: '',
      show: false,
      name: '',
    });
  }, [isOpen]);

  const confirmHandler = async () => {
    if (!state.password || props.ready === false || !waitReady) return;
    try {
      setWaitReady(false);
      const signedMessage = await props.sign(state.password);
      await props.onConfirm(true, signedMessage);
    } catch (e) {
      if (e === ERROR.wrongPassword)
        setState((s) => ({ ...s, wrongPassword: true }));
      else await props.onConfirm(false, e);
    }
    setWaitReady(true);
  };

  return (
    <Modal
      size="xs"
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      initialFocusRef={inputRef}
    >
      <ModalOverlay />
      <ModalContent m={0}>
        <ModalHeader fontSize="md">
          {props.title ? props.title : 'Confirm with password'}
        </ModalHeader>
        <ModalBody>
          {props.info}
          <InputGroup size="md">
            <Input
              ref={inputRef}
              focusBorderColor="teal.400"
              variant="filled"
              isInvalid={state.wrongPassword === true}
              pr="4.5rem"
              type={state.show ? 'text' : 'password'}
              onChange={(e) =>
                setState((s) => ({ ...s, password: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key == 'Enter') confirmHandler();
              }}
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
          <Button
            mr={3}
            variant="ghost"
            onClick={props.onCloseBtn ? props.onCloseBtn : onClose}
          >
            Close
          </Button>
          <Button
            isDisabled={!state.password || props.ready === false || !waitReady}
            isLoading={!waitReady}
            colorScheme="teal"
            onClick={confirmHandler}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ConfirmModalHw = ({ props, isOpen, onClose, hw }) => {
  const [waitReady, setWaitReady] = React.useState(true);
  const [error, setError] = React.useState('');
  const ref = React.useRef();

  const confirmHandler = async () => {
    if (props.ready === false || !waitReady) return;
    try {
      setWaitReady(false);
      const appAda = await initHW({ device: hw.device, id: hw.id });
      if (hw.device == HW.trezor) ref.current.openModal();
      const signedMessage = await props.sign(null, { ...hw, appAda });
      if (hw.device == HW.trezor) ref.current.closeModal();
      await props.onConfirm(true, signedMessage);
    } catch (e) {
      if (hw.device == HW.trezor) ref.current.closeModal();
      if (e === ERROR.submit) props.onConfirm(false, e);
      else setError('An error occured');
    }
    setWaitReady(true);
  };

  React.useEffect(() => {
    setError('');
  }, [isOpen]);

  return (
    <>
      <Modal size="xs" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent m={0}>
          <ModalHeader fontSize="md">
            {props.title ? props.title : `Confirm with device`}
          </ModalHeader>
          <ModalBody>
            {props.info}
            <Box
              width="full"
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                background={hw.device == HW.ledger ? 'blue.400' : 'green.400'}
                rounded="xl"
                py={2}
                width="70%"
                color="white"
              >
                <Icon as={MdUsb} boxSize={5} mr={2} />
                <Box fontSize="sm">
                  {!waitReady
                    ? `Waiting for ${
                        hw.device == HW.ledger ? 'Ledger' : 'Trezor'
                      }`
                    : `Connect ${hw.device == HW.ledger ? 'Ledger' : 'Trezor'}`}
                </Box>
              </Box>
              {error && (
                <Text mt={2} color="red.300">
                  {error}
                </Text>
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              mr={3}
              variant="ghost"
              onClick={props.onCloseBtn ? props.onCloseBtn : onClose}
            >
              Close
            </Button>
            <Button
              isDisabled={props.ready === false || !waitReady}
              isLoading={!waitReady}
              colorScheme="teal"
              onClick={confirmHandler}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <TrezorWidget ref={ref} />
    </>
  );
};

export default ConfirmModal;
