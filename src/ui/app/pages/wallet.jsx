import React from 'react';
import { Button } from '@chakra-ui/button';
import { useHistory } from 'react-router-dom';
import {
  avatarToImage,
  createAccount,
  deleteAccount,
  displayUnit,
  getAccounts,
  getBalance,
  getCurrentAccount,
  switchAccount,
  updateAccount,
} from '../../../api/extension';
import { Box, Spacer, Stack, Text } from '@chakra-ui/layout';

import {
  BsArrowDownRight,
  BsArrowUpRight,
  BsFillPersonPlusFill,
} from 'react-icons/bs';
import {
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Tooltip,
} from '@chakra-ui/react';
import { SettingsIcon, AddIcon, StarIcon, DeleteIcon } from '@chakra-ui/icons';
import Scrollbars from 'react-custom-scrollbars';
import QRCode from 'react-qr-code';
import provider from '../../../config/provider';

const Wallet = ({ data }) => {
  const history = useHistory();
  const [state, setState] = React.useState({
    account: null,
    accounts: null,
    fiatPrice: 0,
  });
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const newAccountRef = React.useRef();
  const deletAccountRef = React.useRef();

  const getData = async () => {
    setLoading(true);
    let currentAccount = await getCurrentAccount();
    let allAccounts = await getAccounts();
    const fiatPrice = await provider.api.price();
    setState((s) => ({
      ...s,
      account: currentAccount,
      accounts: allAccounts,
      fiatPrice,
    }));
    await updateAccount();
    currentAccount = await getCurrentAccount();
    allAccounts = await getAccounts();
    setState((s) => ({ ...s, account: currentAccount, accounts: allAccounts }));
  };

  React.useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <Box
        height="100vh"
        display="flex"
        alignItems="center"
        flexDirection="column"
      >
        <Box
          height="52"
          roundedBottom="3xl"
          background="teal.400"
          shadow="md"
          width="full"
          position="relative"
        >
          <Box zIndex="2" position="absolute" top="6" right="6">
            <Menu autoSelect={false}>
              <MenuButton
                position="relative"
                rounded="full"
                background="white"
                width="14"
                height="14"
                as={Button}
              >
                {state.account && (
                  <img
                    style={{ position: 'absolute', top: 5, right: 6 }}
                    src={avatarToImage(state.account.avatar)}
                    width="76%"
                  />
                )}
              </MenuButton>
              <MenuList>
                <MenuGroup title="Accounts">
                  <Scrollbars
                    style={{ width: '100%' }}
                    autoHeight
                    autoHeightMax={270}
                  >
                    {state.accounts &&
                      Object.keys(state.accounts).map((accountIndex) => {
                        const account = state.accounts[accountIndex];
                        return (
                          <MenuItem
                            position="relative"
                            key={accountIndex}
                            onClick={async () => {
                              if (state.account.index === account.index) return;
                              await switchAccount(accountIndex);
                              getData();
                            }}
                          >
                            <Stack direction="row" alignItems="center">
                              <Image
                                boxSize="2rem"
                                rounded="full"
                                src={avatarToImage(account.avatar)}
                                mr="12px"
                              />
                              <Box display="flex" flexDirection="column">
                                <Box height="1.5" />
                                <Text mb="-1" fontWeight="bold" fontSize="14px">
                                  {account.name}
                                </Text>
                                <Text>
                                  {displayUnit(
                                    account.amount.find(
                                      (am) => am.unit === 'lovelace'
                                    ).quantity,
                                    6
                                  ).toLocaleString()}{' '}
                                  ₳
                                </Text>
                              </Box>
                              {state.account.index === account.index && (
                                <>
                                  <Box width="2" />
                                  <StarIcon />
                                </>
                              )}
                            </Stack>
                          </MenuItem>
                        );
                      })}
                  </Scrollbars>
                </MenuGroup>
                <MenuDivider />

                <MenuItem
                  icon={<AddIcon />}
                  onClick={() => newAccountRef.current.openModal()}
                >
                  {' '}
                  New Account
                </MenuItem>
                {state.account &&
                  state.accounts &&
                  state.account.index >=
                    Object.keys(state.accounts).length - 1 &&
                  Object.keys(state.accounts).length > 1 && (
                    <MenuItem
                      color="red.500"
                      icon={<DeleteIcon />}
                      onClick={() => deletAccountRef.current.openModal()}
                    >
                      {' '}
                      Delete Account
                    </MenuItem>
                  )}
                <MenuDivider />
                <MenuItem icon={<SettingsIcon />}>Settings</MenuItem>
                <MenuItem>Help</MenuItem>
              </MenuList>
            </Menu>
          </Box>
          <Box
            zIndex="1"
            position="absolute"
            width="full"
            top="8"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontSize="lg">
              {state.account && state.account.name}
            </Text>
          </Box>
          <Box
            position="absolute"
            width="full"
            height="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontSize="2xl" fontWeight="bold">
              {state.account
                ? displayUnit(
                    state.account.amount.find((am) => am.unit === 'lovelace')
                      .quantity
                  ).toLocaleString()
                : '...'}{' '}
              ₳
            </Text>
          </Box>
          <Box
            style={{ bottom: 66 }}
            position="absolute"
            width="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontSize="md">
              (
              {state.account
                ? (
                    displayUnit(
                      state.account.amount.find((am) => am.unit === 'lovelace')
                        .quantity
                    ) * state.fiatPrice
                  ).toFixed(2)
                : '...'}{' '}
              $)
            </Text>
          </Box>

          <Box
            position="absolute"
            style={{ top: 186, right: 134 }}
            width="20"
            height="8"
          >
            <Popover matchWidth={true}>
              <PopoverTrigger>
                <Button
                  rightIcon={<Icon as={BsArrowDownRight} />}
                  background="white"
                  color="orange.400"
                  rounded="xl"
                  size="sm"
                  shadow="md"
                >
                  Receive
                </Button>
              </PopoverTrigger>
              <PopoverContent width="60">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody
                  mt="8"
                  alignItems="center"
                  justifyContent="center"
                  display="flex"
                  flexDirection="column"
                  textAlign="center"
                >
                  {state.account && (
                    <>
                      <QRCode size={140} value={state.account.paymentAddr} />
                      <Box height="4" />
                      <Tooltip isOpen={copied} label="Copied address">
                        <Text
                          onClick={() => {
                            navigator.clipboard.writeText(
                              state.account.paymentAddr
                            );
                            setCopied(true);
                            setTimeout(() => setCopied(false), 800);
                          }}
                          lineHeight="1.2"
                          cursor="pointer"
                          wordBreak="break-all"
                        >
                          {state.account.paymentAddr}
                        </Text>
                      </Tooltip>
                    </>
                  )}
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Box>

          <Box
            position="absolute"
            style={{ top: 186, right: 24 }}
            width="20"
            height="8"
          >
            <Button
              size="sm"
              rightIcon={<Icon as={BsArrowUpRight} />}
              colorScheme="orange"
              rounded="xl"
              shadow="md"
            >
              Send
            </Button>
          </Box>
        </Box>
      </Box>
      <NewAccountModal onCreate={() => getData()} ref={newAccountRef} />
      <DeleteAccountModal
        name={state.account && state.account.name}
        onDelete={() => getData()}
        ref={deletAccountRef}
      />
    </>
  );
};

const NewAccountModal = React.forwardRef((props, ref) => {
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
  }));

  React.useEffect(() => {
    setState({
      password: '',
      show: false,
      name: '',
    });
  }, [isOpen]);

  return (
    <Modal size="sm" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">Create new account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box display="flex" alignItems="center" justifyContent="center">
            <Icon as={BsFillPersonPlusFill} w={6} h={6} />
          </Box>
          <Spacer height="4" />
          <Input
            onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
            placeholder="Enter account name"
          />
          <Spacer height="4" />
          <InputGroup size="md">
            <Input
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
            isDisabled={!state.password || !state.name}
            colorScheme="teal"
            onClick={async () => {
              try {
                await createAccount(state.name, state.password);
                props.onCreate();
                onClose();
              } catch (e) {
                setState((s) => ({ ...s, wrongPassword: true }));
              }
            }}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

const DeleteAccountModal = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
  }));

  return (
    <AlertDialog
      size="sm"
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="md" fontWeight="bold">
            Delete current account
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text fontSize="sm">
              Are you sure you want to delete {props.name}?
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={async () => {
                await deleteAccount();
                await switchAccount(0);
                props.onDelete();
                onClose();
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
});

const ReceivePopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button>Trigger</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Confirmation!</PopoverHeader>
        <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default Wallet;
