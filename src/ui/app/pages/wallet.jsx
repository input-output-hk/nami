import React from 'react';
import { Button } from '@chakra-ui/button';
import { useHistory } from 'react-router-dom';
import {
  createAccount,
  deleteAccount,
  displayUnit,
  getAccounts,
  getCurrentAccount,
  getCurrentAccountIndex,
  getDelegation,
  getNetwork,
  getTransactions,
  setBalanceWarning,
  switchAccount,
  updateAccount,
} from '../../../api/extension';
import { Box, Spacer, Stack, Text } from '@chakra-ui/layout';

import { BsArrowDownRight, BsArrowUpRight } from 'react-icons/bs';
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
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  SettingsIcon,
  AddIcon,
  StarIcon,
  DeleteIcon,
  CopyIcon,
  ChevronDownIcon,
  InfoOutlineIcon,
} from '@chakra-ui/icons';
import Scrollbars from 'react-custom-scrollbars';
import QrCode from '../components/qrCode';
import provider from '../../../config/provider';
import UnitDisplay from '../components/unitDisplay';
import { onAccountChange } from '../../../api/extension';
import AssetsViewer from '../components/assetsViewer';
import HistoryViewer from '../components/historyViewer';
import Copy from '../components/copy';
import About from '../components/about';
import { useStoreState } from 'easy-peasy';
import AvatarLoader from '../components/avatarLoader';
import { currencyToSymbol } from '../../../api/util';
import TransactionBuilder from '../components/transactionBuilder';
import { NETWORK_ID } from '../../../config/config';
import { BalanceWarning } from '../components/balanceWarning';

// Assets
import Logo from '../../../assets/img/logoWhite.svg';

const useIsMounted = () => {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);
  return isMounted;
};

const Wallet = () => {
  const isMounted = useIsMounted();
  const history = useHistory();
  const settings = useStoreState((state) => state.settings.settings);
  const avatarBg = useColorModeValue('white', 'gray.700');
  const panelBg = useColorModeValue('teal.400', 'gray.800');
  const [state, setState] = React.useState({
    account: null,
    accounts: null,
    fiatPrice: 0,
    delegation: null,
    network: { id: '', node: '' },
  });
  const [menu, setMenu] = React.useState(false);
  const newAccountRef = React.useRef();
  const aboutRef = React.useRef();
  const deletAccountRef = React.useRef();
  const [info, setInfo] = React.useState({
    avatar: '',
    name: '',
    paymentAddr: '',
    accounts: {},
  }); // for quicker displaying
  const builderRef = React.useRef();

  const checkTransactions = () =>
    setInterval(async () => {
      const currentAccount = await getCurrentAccount();
      const transactions = await getTransactions();
      const network = await getNetwork();
      if (
        transactions.length > 0 &&
        currentAccount[network.id].lastUpdate !== transactions[0].txHash
      ) {
        await getData();
      }
    }, 10000);

  const getData = async () => {
    const currentIndex = await getCurrentAccountIndex();
    const accounts = await getAccounts();
    const { avatar, name, index, paymentAddr } = accounts[currentIndex];
    if (!isMounted.current) return;
    setInfo({ avatar, name, currentIndex: index, paymentAddr, accounts });
    setState((s) => ({
      ...s,
      account: null,
      delegation: null,
    }));
    await updateAccount();
    const allAccounts = await getAccounts();
    const currentAccount = allAccounts[currentIndex];
    const fiatPrice = await provider.api.price(settings.currency);
    const network = await getNetwork();
    const delegation = await getDelegation();
    const warning = await setBalanceWarning();
    if (!isMounted.current) return;
    setState((s) => ({
      ...s,
      account: currentAccount,
      accounts: allAccounts,
      fiatPrice,
      network,
      delegation,
      warning: warning,
    }));
  };

  React.useEffect(() => {
    let accountChangeHandler;
    let txInterval;
    getData().then(() => {
      if (!isMounted.current) return;
      txInterval = checkTransactions();
      accountChangeHandler = onAccountChange(getData);
    });
    return () => {
      clearInterval(txInterval);
      accountChangeHandler && accountChangeHandler.remove();
    };
  }, []);

  return (
    <>
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        flexDirection="column"
      >
        <Box
          height="52"
          roundedBottom="3xl"
          background={panelBg}
          shadow="md"
          width="full"
          position="relative"
        >
          <Box
            zIndex="2"
            position="absolute"
            top="6"
            left="6"
            width="14"
            height="14"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Image draggable={false} width="30px" src={Logo} />
          </Box>
          {/* Delegation */}
          <Box zIndex="1" position="absolute" width="full" bottom="5" left="6">
            {state.delegation && (
              <>
                {state.delegation.active ? (
                  <DelegationPopover
                    account={state.account}
                    delegation={state.delegation}
                  >
                    {state.delegation.ticker}
                  </DelegationPopover>
                ) : (
                  state.network.id === NETWORK_ID.mainnet && (
                    <Button
                      onClick={() =>
                        builderRef.current.initDelegation(
                          state.account,
                          state.delegation
                        )
                      }
                      variant="solid"
                      size="xs"
                      colorScheme="whiteAlpha"
                      rounded="lg"
                    >
                      Delegate
                    </Button>
                  )
                )}
              </>
            )}
          </Box>
          <Box zIndex="2" position="absolute" top="6" right="6">
            <Menu
              isOpen={menu}
              autoSelect={false}
              onClose={() => setMenu(false)}
            >
              <MenuButton
                onClick={() => setMenu(true)}
                position="relative"
                rounded="full"
                background={avatarBg}
                width="14"
                height="14"
                as={Button}
              >
                <Box position="absolute" top="5px" right="6px" width="76%">
                  <AvatarLoader avatar={info.avatar} />
                </Box>
              </MenuButton>
              <MenuList fontSize="xs">
                <MenuGroup title="Accounts">
                  <Scrollbars
                    style={{ width: '100%' }}
                    autoHeight
                    autoHeightMax={240}
                  >
                    {Object.keys(info.accounts).map((accountIndex) => {
                      const accountInfo = info.accounts[accountIndex];
                      const account =
                        state.accounts && state.accounts[accountIndex];
                      return (
                        <MenuItem
                          isDisabled={!state.account}
                          position="relative"
                          key={accountIndex}
                          onClick={async (e) => {
                            if (
                              info.currentIndex === accountInfo.index ||
                              !state.account
                            ) {
                              return;
                            }
                            await switchAccount(accountIndex);
                          }}
                        >
                          <Stack direction="row" alignItems="center">
                            <Box boxSize="2rem" mr="12px">
                              <AvatarLoader avatar={accountInfo.avatar} />
                            </Box>

                            <Box display="flex" flexDirection="column">
                              <Box height="1.5" />
                              <Text
                                mb="-1"
                                fontWeight="bold"
                                fontSize="14px"
                                isTruncated={true}
                                maxWidth="210px"
                              >
                                {accountInfo.name}
                              </Text>
                              <UnitDisplay
                                quantity={
                                  account &&
                                  account[state.network.id].lovelace -
                                    account[state.network.id].minAda
                                }
                                decimals={6}
                                symbol={settings.adaSymbol}
                              />
                            </Box>
                            {info.currentIndex === accountInfo.index && (
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
                      color="red.300"
                      icon={<DeleteIcon />}
                      onClick={() => deletAccountRef.current.openModal()}
                    >
                      Delete Account
                    </MenuItem>
                  )}
                <MenuDivider />
                <MenuItem
                  fontWeight="bold"
                  isDisabled={
                    !state.account ||
                    (state.account && state.network.id !== NETWORK_ID.mainnet)
                  }
                  onClick={() =>
                    builderRef.current.initDelegation(
                      state.account,
                      state.delegation
                    )
                  }
                >
                  Stake & Earn Rewards
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  onClick={() => history.push('/settings')}
                  icon={<SettingsIcon />}
                >
                  Settings
                </MenuItem>
                <MenuItem onClick={() => aboutRef.current.openModal()}>
                  About
                </MenuItem>
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
            <Text
              color="white"
              fontSize="lg"
              isTruncated={true}
              maxWidth="210px"
            >
              {info.name}
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
            {state.warning && state.warning.active && (
              <BalanceWarning
                fullBalance={state.warning.fullBalance}
                symbol={settings.adaSymbol}
              />
            )}
            <UnitDisplay
              color="white"
              fontSize="2xl"
              fontWeight="bold"
              quantity={
                state.account && state.account.lovelace - state.account.minAda
              }
              decimals={6}
              symbol={settings.adaSymbol}
            />
            {state.account && state.account.assets.length ? (
              <Tooltip
                label={
                  <Box display="flex">
                    <Text mr="0.5">+</Text>
                    <UnitDisplay
                      quantity={state.account.minAda}
                      symbol={settings.adaSymbol}
                      decimals={6}
                    />
                    <Text ml="1">locked with assets</Text>
                  </Box>
                }
                fontSize="sm"
                hasArrow
                placement="auto"
              >
                <InfoOutlineIcon
                  cursor="help"
                  color="white"
                  ml="10px"
                  width="14px"
                  height="14px"
                  display="inline-block"
                />
              </Tooltip>
            ) : (
              ''
            )}
          </Box>
          <Box
            style={{ bottom: 66 }}
            position="absolute"
            width="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <UnitDisplay
              color="white"
              fontSize="md"
              quantity={
                state.account &&
                parseInt(
                  displayUnit(
                    (
                      BigInt(state.account.lovelace) -
                      BigInt(state.account.minAda)
                    ).toString()
                  ) *
                    state.fiatPrice *
                    10 ** 2
                )
              }
              symbol={currencyToSymbol(settings.currency)}
              decimals={2}
            />
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
                  colorScheme="teal"
                  size="sm"
                  rounded="xl"
                  shadow="md"
                >
                  Receive
                </Button>
              </PopoverTrigger>
              <PopoverContent width="60">
                <PopoverArrow />
                <PopoverBody
                  mt="5"
                  alignItems="center"
                  justifyContent="center"
                  display="flex"
                  flexDirection="column"
                  textAlign="center"
                >
                  <>
                    <Box>
                      <QrCode value={info.paymentAddr} />
                    </Box>
                    <Box height="4" />
                    <Copy label="Copied address" copy={info.paymentAddr}>
                      <Text
                        maxWidth="200px"
                        fontSize="xs"
                        lineHeight="1.2"
                        cursor="pointer"
                        wordBreak="break-all"
                      >
                        {info.paymentAddr} <CopyIcon />
                      </Text>
                    </Copy>
                    <Box height="2" />
                  </>
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
              onClick={() => history.push('/send')}
              size="sm"
              rounded="xl"
              rightIcon={<Icon as={BsArrowUpRight} />}
              colorScheme="orange"
              shadow="md"
            >
              Send
            </Button>
          </Box>
        </Box>
        <Box height="8" />
        <Tabs
          isLazy={true}
          lazyBehavior="unmount"
          width="full"
          alignItems="center"
          display="flex"
          flexDirection="column"
          variant="soft-rounded"
          colorScheme="teal"
        >
          <TabList>
            <Tab>Assets</Tab>
            <Tab>History</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <AssetsViewer assets={state.account && state.account.assets} />
            </TabPanel>
            <TabPanel>
              <HistoryViewer
                network={state.network}
                history={state.account && state.account.history}
                currentAddr={state.account && state.account.paymentAddr}
                addresses={
                  state.accounts &&
                  Object.keys(state.accounts).map(
                    (index) => state.accounts[index].paymentAddr
                  )
                }
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <NewAccountModal ref={newAccountRef} />
      <DeleteAccountModal
        name={state.account && state.account.name}
        ref={deletAccountRef}
      />
      <TransactionBuilder ref={builderRef} />
      <About ref={aboutRef} />
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
    <Modal size="xs" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">Create new account</ModalHeader>
        <ModalCloseButton />
        <ModalBody px="10">
          <Input
            autoFocus={true}
            onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
            placeholder="Enter account name"
          />
          <Spacer height="4" />
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
            isDisabled={!state.password || !state.name}
            colorScheme="teal"
            onClick={async () => {
              try {
                await createAccount(state.name, state.password);
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
      size="xs"
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
              Are you sure you want to delete <b>{props.name}</b>?
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

const DelegationPopover = ({ account, delegation, children }) => {
  const settings = useStoreState((state) => state.settings.settings);
  const withdrawRef = React.useRef();
  return (
    <>
      <Popover matchWidth={true} offset={[80, 8]}>
        <PopoverTrigger>
          <Button
            style={{
              all: 'revert',
              background: 'none',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
            rightIcon={<ChevronDownIcon />}
          >
            {children}
          </Button>
        </PopoverTrigger>
        <PopoverContent width="60">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody
            mt="2"
            alignItems="center"
            justifyContent="center"
            display="flex"
            flexDirection="column"
            textAlign="center"
          >
            <Text
              fontWeight="bold"
              fontSize="md"
              textDecoration="underline"
              cursor="pointer"
              onClick={() => window.open(delegation.homepage)}
            >
              {delegation.ticker}
            </Text>
            <Box h="2" />
            <Text fontWeight="light" fontSize="xs">
              {delegation.description}
            </Text>
            <Box h="3" />
            <Text fontSize="xs">Available rewards:</Text>
            <UnitDisplay
              hide
              fontWeight="bold"
              fontSize="sm"
              quantity={delegation.rewards}
              decimals={6}
              symbol={settings.adaSymbol}
            />
            <Box h="6" />
            <Button
              onClick={() =>
                withdrawRef.current.initWithdrawal(account, delegation)
              }
              isDisabled={BigInt(delegation.rewards) < BigInt('2000000')}
              colorScheme="teal"
              size="sm"
            >
              Withdraw
            </Button>
            <Box h="2" />
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <TransactionBuilder ref={withdrawRef} />
    </>
  );
};

export default Wallet;
