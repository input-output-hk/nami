import {Button} from '@chakra-ui/button';
import {Input, InputGroup, InputRightElement} from '@chakra-ui/input';
import {Box, Text} from '@chakra-ui/layout';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay,} from '@chakra-ui/modal';
import React from 'react';
import {useToast} from "@chakra-ui/react";
import {STORAGE} from "../../../config/config";
import {decryptWithPassword, encryptWithPassword, getStorage, setStorage} from "../../../api/extension";
import Loader from "../../../api/loader";
import {useDisclosure} from "@chakra-ui/hooks";

export const ChangePasswordModal = React.forwardRef((props, ref) => {

	const cancelRef = React.useRef();
	const inputRef = React.useRef();
	const toast = useToast();

	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isLoading, setIsLoading] = React.useState(false);
	const [state, setState] = React.useState({
		currentPassword: '',
		newPassword: '',
		repeatPassword: '',
		matchingPassword: false,
		passwordLen: null,
		show: false,
	});

  React.useEffect(() => {
    setState({
			currentPassword: '',
			newPassword: '',
			repeatPassword: '',
			passwordLen: null,
			show: false,
    });
  }, [isOpen]);


	React.useImperativeHandle(ref, () => ({
		openModal() {
			onOpen();
		},
	}));


  const confirmHandler = async () => {

    if (!state.currentPassword || !state.newPassword || !state.repeatPassword || state.newPassword !== state.repeatPassword )
			return;

		setIsLoading(true)

		try {

			await Loader.load();

			const encryptedRootKey = await getStorage(STORAGE.encryptedKey);
			const decryptedRootKey = await decryptWithPassword(state.currentPassword, encryptedRootKey)

			const rootKey = Loader.Cardano.Bip32PrivateKey.from_bytes(Buffer.from(decryptedRootKey, 'hex'));
			const newlyEncryptedRootKey = await encryptWithPassword(state.newPassword, rootKey.as_bytes());

			rootKey.free();

			await setStorage({ [STORAGE.encryptedKey]: newlyEncryptedRootKey });

			toast({
				title: 'Password updated',
				status: 'success',
				duration: 5000,
			});

			onClose()

		} catch (e) {

			toast({
				title: e && e.message ? e.message : 'Password update failed!',
				status: 'error',
				duration: 5000,
			});

		}

		setIsLoading(false)

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
        <ModalHeader fontSize="md">Change Password</ModalHeader>
        <ModalBody>

					<Box mb="6" fontSize="sm" width="full">
						Type your current password and new password below, if you want to continue.
					</Box>

					<Box>
						<InputGroup size="md">
							<Input
								ref={inputRef}
								focusBorderColor="teal.400"
								variant="filled"
								pr="4.5rem"
								type={state.show ? 'text' : 'password'}
								onChange={(e) =>
									setState((s) => ({ ...s, currentPassword: e.target.value }))
								}
								placeholder="Enter current password"
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
					</Box>

					<Box height="4" />

					<Box>
						<InputGroup size="md">
							<Input
								focusBorderColor="teal.400"
								variant="filled"
								pr="4.5rem"
								isInvalid={state.passwordLen === false}
								type={state.show ? 'text' : 'password'}
								onChange={(e) =>
									setState((s) => ({ ...s, newPassword: e.target.value }))
								}
								onBlur={(e) =>
									setState((s) => ({ ...s, passwordLen: e.target.value ? e.target.value.length >= 8 : null }))
								}
								placeholder="Enter new password"
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
					</Box>

					{(state.passwordLen === false ) && (
						<Text color="red.300">Password must be at least 8 characters long</Text>
					)}

					<Box height="4" />

					<Box>
						<InputGroup size="md">
							<Input
								focusBorderColor="teal.400"
								variant="filled"
								isInvalid={state.repeatPassword && state.newPassword !== state.repeatPassword}
								pr="4.5rem"
								type={state.show ? 'text' : 'password'}
								onChange={(e) =>
									setState((s) => ({ ...s, repeatPassword: e.target.value }))
								}
								placeholder="Repeat new password"
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

						{(state.repeatPassword && state.repeatPassword !== state.newPassword) && (
							<Text color="red.300">Password doesn't match</Text>
						)}
					</Box>

        </ModalBody>

        <ModalFooter>
          <Button mr={3} variant="ghost" onClick={onClose} ref={cancelRef}>
            Cancel
          </Button>

          <Button
            isDisabled={!state.currentPassword || !state.newPassword || !state.repeatPassword || state.newPassword !== state.repeatPassword || state.passwordLen === false}
            isLoading={isLoading}
            colorScheme="teal"
            onClick={confirmHandler}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});
