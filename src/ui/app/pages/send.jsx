import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  displayUnit,
  getAccounts,
  getCurrentAccount,
  getCurrentAccountIndex,
  getUtxos,
  isValidAddress,
  toUnit,
  updateRecentSentToAddress,
} from '../../../api/extension';
import { Box, Stack, Text } from '@chakra-ui/layout';
import Account from '../components/account';
import Scrollbars from 'react-custom-scrollbars';
import { Button, IconButton } from '@chakra-ui/button';
import ConfirmModal from '../components/confirmModal';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  CloseIcon,
  Icon,
  SmallCloseIcon,
} from '@chakra-ui/icons';
import { BsArrowUpRight } from 'react-icons/bs';
import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/input';
import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/popover';
import MiddleEllipsis from 'react-middle-ellipsis';
import { Avatar } from '@chakra-ui/avatar';
import UnitDisplay from '../components/unitDisplay';
import {
  assetsToValue,
  buildTx,
  initTx,
  minAdaRequired,
  signAndSubmit,
  structureToUtxo,
  sumUtxos,
  valueToAssets,
} from '../../../api/extension/wallet';
import { FixedSizeList as List } from 'react-window';
import { useDisclosure } from '@chakra-ui/hooks';
import AssetBadge from '../components/assetBadge';
import { ERROR } from '../../../config/config';
import {
  background,
  InputRightElement,
  LightMode,
  Spinner,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { Planet } from 'react-kawaii';
import Loader from '../../../api/loader';
import { useSettings } from '../components/settingsProvider';
import AvatarLoader from '../components/avatarLoader';

let timer = null;

const Send = () => {
  const { settings } = useSettings();
  const history = useHistory();
  const toast = useToast();
  const ref = React.useRef();
  const [account, setAccount] = React.useState(null);
  const [fee, setFee] = React.useState({ fee: '0' });
  const [address, setAddress] = React.useState({ result: '' });
  const [loaded, setLoaded] = React.useState(false);
  const focus = React.useRef(false);
  const [value, setValue] = React.useState({
    ada: '',
    assets: [],
    personalAda: '',
    minAda: '0',
  });
  const [txInfo, setTxInfo] = React.useState({
    protocolParameters: null,
    utxos: [],
    balance: { lovelace: '0', assets: null },
  });
  const [tx, setTx] = React.useState(null);
  const prepareTx = async (v, a, count) => {
    await Loader.load();
    const _value = v || value;
    const _address = a || address;
    if (!_value.ada && _value.assets.length <= 0) {
      setFee({ fee: '0' });
      setTx(null);
      return;
    }
    if (
      _address.error ||
      !_address.result ||
      (!_value.ada && _value.assets.length <= 0)
    ) {
      setFee({ fee: '0' });
      setTx(null);
      return;
    }
    if (count >= 5) throw ERROR.txNotPossible;

    setFee({ fee: '' });
    setTx(null);
    await new Promise((res, rej) => setTimeout(() => res()));
    try {
      const output = {
        address: _address.result,
        amount: [
          {
            unit: 'lovelace',
            quantity: toUnit(_value.ada || '10000000'),
          },
        ],
      };

      for (const asset of _value.assets) {
        if (!asset.input || BigInt(asset.input || '0') < 1) {
          setFee({ error: 'Assets quantity not set' });
          return;
        }
        output.amount.push({
          unit: asset.unit,
          quantity: toUnit(asset.input, 0),
        });
      }

      const outputValue = await assetsToValue(output.amount);
      const minAda = await minAdaRequired(
        outputValue,
        txInfo.protocolParameters.minUtxo
      );

      if (BigInt(minAda) <= BigInt(toUnit(_value.personalAda || '0'))) {
        const displayAda = parseFloat(
          _value.personalAda.replace(/[,\s]/g, '')
        ).toLocaleString('en-EN', { minimumFractionDigits: 6 });
        output.amount[0].quantity = toUnit(_value.personalAda || '0');
        !focus.current && setValue((v) => ({ ...v, ada: displayAda }));
      } else if (_value.assets.length > 0) {
        output.amount[0].quantity = minAda;
        const minAdaDisplay = parseFloat(
          displayUnit(minAda).toString().replace(/[,\s]/g, '')
        ).toLocaleString('en-EN', { minimumFractionDigits: 6 });
        setValue((v) => ({
          ...v,
          ada: minAdaDisplay,
        }));
      }

      const outputs = Loader.Cardano.TransactionOutputs.new();
      outputs.add(
        Loader.Cardano.TransactionOutput.new(
          Loader.Cardano.Address.from_bech32(_address.result),
          await assetsToValue(output.amount)
        )
      );

      setValue((v) => ({ ...v, minAda }));
      const tx = await buildTx(
        account,
        txInfo.utxos,
        outputs,
        txInfo.protocolParameters
      );

      setFee({ fee: tx.body().fee().to_str() });
      setTx(tx);
    } catch (e) {
      if (!_value.ada) setFee({ fee: '0' });
      else setFee({ error: 'Transaction not possible' });
      prepareTx(v, a, count + 1);
    }
  };

  const getInfo = async () => {
    const currentAccount = await getCurrentAccount();
    setAccount(currentAccount);
    const utxos = await getUtxos();
    const protocolParameters = await initTx();
    setLoaded(true);
    const utxoSum = await sumUtxos(utxos);
    let balance = await valueToAssets(utxoSum);
    balance = {
      lovelace: balance.find((v) => v.unit === 'lovelace').quantity,
      assets: balance.filter((v) => v.unit !== 'lovelace'),
    };
    setTxInfo({ protocolParameters, utxos, balance });
  };

  React.useEffect(() => {
    getInfo();
  }, []);
  return (
    <>
      <Box
        height="100vh"
        display="flex"
        alignItems="center"
        flexDirection="column"
        position="relative"
      >
        <Account />
        <Box position="absolute" top="24" left="6">
          <IconButton
            rounded="md"
            onClick={() => history.goBack()}
            variant="ghost"
            icon={<ChevronLeftIcon boxSize="6" />}
          />
        </Box>
        <Box height="20" />
        <Text fontSize="lg" fontWeight="bold">
          Send To
        </Text>
        <Box height="6" />
        <Box
          display="flex"
          alignItems="center"
          flexDirection="column"
          justifyContent="center"
          width="80%"
        >
          <AddressPopup
            setAddress={setAddress}
            address={address}
            prepareTx={prepareTx}
          />
          {address.error && (
            <Text width="full" textAlign="left" color="red.300">
              Address is invalid
            </Text>
          )}
          <Box height="4" />
          <Stack direction="row" alignItems="center" justifyContent="center">
            <InputGroup size="sm" flex={3}>
              <InputLeftAddon
                rounded="md"
                children={
                  loaded ? (
                    settings.adaSymbol
                  ) : (
                    <Spinner
                      color="teal"
                      speed="0.5s"
                      boxSize="9px"
                      size="xs"
                    />
                  )
                }
              />
              <Input
                isDisabled={!loaded}
                isInvalid={
                  value.ada &&
                  (BigInt(toUnit(value.ada)) < BigInt(value.minAda) ||
                    BigInt(toUnit(value.ada)) >
                      BigInt(txInfo.balance.lovelace || '0'))
                }
                onFocus={() => (focus.current = true)}
                onBlur={(e) => {
                  if (
                    !e.target.value ||
                    !e.target.value.match(/^,+|(,)+|d*[0-9,.]\d*$/)
                  )
                    return;
                  const displayAda = parseFloat(
                    e.target.value.replace(/[,\s]/g, '')
                  ).toLocaleString('en-EN', { minimumFractionDigits: 6 });
                  setValue((v) => ({ ...v, ada: displayAda }));
                  focus.current = false;
                }}
                value={value.ada}
                onInput={(e) => {
                  clearTimeout(timer);
                  if (
                    e.target.value &&
                    !e.target.value.match(/^,+|(,)+|d*[0-9,.]\d*$/)
                  )
                    return;

                  value.ada = e.target.value;
                  value.personalAda = e.target.value;
                  const v = value;
                  setValue((v) => ({
                    ...v,
                    ada: e.target.value,
                    personalAda: e.target.value,
                  }));
                  timer = setTimeout(() => {
                    prepareTx(v, undefined, 0);
                  }, 800);
                }}
                placeholder="0.000000"
                rounded="md"
              />
            </InputGroup>
            <AssetsSelector
              assets={txInfo.balance.assets}
              setValue={setValue}
              value={value}
            />
          </Stack>
          <Box height="6" />
          <Scrollbars
            style={{
              width: '100%',
              height: '150px',
            }}
          >
            <Box display="flex" width="full" flexWrap="wrap" paddingRight="2">
              {value.assets.map((asset, index) => (
                <Box key={index}>
                  <AssetBadge
                    onRemove={() => {
                      clearTimeout(timer);
                      let hasInput = value.assets[index].input;
                      delete value.assets[index].input;
                      delete value.assets[index].loaded;
                      value.assets = value.assets.filter(
                        (a) => a.unit != asset.unit
                      );
                      const v = value;
                      setValue((v) => ({ ...v, assets: value.assets }));
                      timer = setTimeout(() => {
                        prepareTx(v, undefined, 0);
                      }, 300);
                    }}
                    onLoad={({ displayName, image }) => {
                      clearTimeout(timer);
                      value.assets[index].loaded = true;
                      value.assets[index].displayName = displayName;
                      value.assets[index].image = image;
                      const v = value;
                      setValue((v) => ({ ...v, assets: value.assets }));
                      timer = setTimeout(() => {
                        prepareTx(v, undefined, 0);
                      }, 300);
                    }}
                    onInput={(val) => {
                      clearTimeout(timer);
                      value.assets[index].input = val;
                      const v = value;
                      setValue((v) => ({ ...v, assets: value.assets }));
                      timer = setTimeout(() => {
                        prepareTx(v, undefined, 0);
                      }, 500);
                    }}
                    asset={asset}
                  />
                </Box>
              ))}
            </Box>
          </Scrollbars>
        </Box>

        <Box
          position="absolute"
          width="full"
          bottom="24"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            fontSize="sm"
          >
            {fee.error ? (
              <Text fontSize="xs" color="red.300">
                {fee.error}
              </Text>
            ) : (
              <>
                {' '}
                <Text fontWeight="bold">+ Fee: </Text>
                <UnitDisplay
                  quantity={!address.result ? '0' : fee.fee}
                  decimals={6}
                  symbol={settings.adaSymbol}
                />
              </>
            )}
          </Stack>
        </Box>
        <Box
          position="absolute"
          width="full"
          bottom="8"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <LightMode>
            <Button
              isDisabled={!tx || fee.error}
              colorScheme="orange"
              onClick={() => ref.current.openModal()}
              rightIcon={<Icon as={BsArrowUpRight} />}
            >
              Send
            </Button>
          </LightMode>
        </Box>
      </Box>
      <ConfirmModal
        ref={ref}
        sign={(password) =>
          signAndSubmit(
            tx,
            {
              accountIndex: account.index,
              keyHashes: [account.paymentKeyHash],
            },
            password
          )
        }
        onConfirm={async (status, signedTx) => {
          if (status === true) {
            toast({
              title: 'Transaction submitted',
              status: 'success',
              duration: 5000,
            });
            await updateRecentSentToAddress(address.result);
          } else
            toast({
              title: 'Transaction failed',
              status: 'error',
              duration: 5000,
            });
          ref.current.closeModal();
          setTimeout(() => history.goBack(), 200);
        }}
      />
    </>
  );
};

// Address Popup
const AddressPopup = ({ setAddress, address, prepareTx }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const ref = React.useRef(false);
  const [state, setState] = React.useState({
    currentAccount: null,
    accounts: {},
    recentAddress: null,
  });
  const init = async () => {
    const currentAccount = await getCurrentAccount();
    const accounts = await getAccounts();
    const recentAddress =
      currentAccount.recentSendToAddresses &&
      currentAccount.recentSendToAddresses[0];
    setState({ currentAccount, accounts, recentAddress });
  };
  React.useEffect(() => {
    init();
  }, []);
  return (
    <Popover
      isOpen={isOpen}
      onOpen={() => !address.result && !address.error && onOpen()}
      autoFocus={false}
      onClose={async () => {
        await new Promise((res, rej) => setTimeout(() => res()));
        if (ref.current) {
          ref.current = false;
          return;
        }
        onClose();
      }}
      gutter={0}
    >
      <PopoverTrigger>
        <Input
          value={address.result}
          onBlur={async (e) => {
            await new Promise((res, rej) => setTimeout(() => res()));
            if (ref.current) {
              ref.current = false;
              return;
            }
            onClose();
            setTimeout(() => e.target.blur());
          }}
          fontSize="xs"
          placeholder="Receiver"
          onInput={async (e) => {
            clearTimeout(timer);
            const val = e.target.value;
            let addr;
            addr = { result: val };
            if (!e.target.value) {
              addr = { result: '' };
            } else if (await isValidAddress(val)) {
              addr = { result: val };
            } else {
              addr = { result: val, error: 'Address is invalid' };
            }
            setAddress(addr);
            onClose();

            timer = setTimeout(() => {
              prepareTx(undefined, addr, 0);
            }, 300);
          }}
          isInvalid={address.error}
        />
      </PopoverTrigger>
      <PopoverContent
        onClick={() => {
          ref.current = false;
        }}
        onFocus={() => {
          ref.current = true;
        }}
        _focus={{}}
      >
        <PopoverBody pr="-2">
          <Scrollbars style={{ width: '100%' }} autoHeight autoHeightMax={240}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              marginRight="4"
            >
              {state.recentAddress && (
                <Button
                  ml="2"
                  my="1"
                  variant="ghost"
                  width="full"
                  onClick={() => {
                    clearTimeout(timer);
                    const address = state.recentAddress;
                    setAddress({
                      result: address,
                    });
                    onClose();
                    timer = setTimeout(() => {
                      prepareTx(undefined, { result: address }, 0);
                    }, 300);
                  }}
                >
                  <Box display="flex" flexDirection="column" width="full">
                    <Text fontWeight="bold" fontSize="13" textAlign="left">
                      Recent
                    </Text>
                    <Box h="0.5" />
                    <Box
                      fontSize="11"
                      textAlign="left"
                      whiteSpace="nowrap"
                      fontWeight="normal"
                    >
                      <MiddleEllipsis>
                        <span>{state.recentAddress}</span>
                      </MiddleEllipsis>
                    </Box>
                  </Box>
                </Button>
              )}
              {Object.keys(state.accounts).filter(
                (index) => index != state.currentAccount.index
              ).length >= 0 && (
                <>
                  {' '}
                  <Text
                    width="full"
                    mt="3"
                    mb="2"
                    fontWeight="bold"
                    fontSize="13"
                    textAlign="left"
                  >
                    Accounts
                  </Text>
                  {Object.keys(state.accounts)
                    .filter((index) => index != state.currentAccount.index)
                    .map((index) => {
                      const account = state.accounts[index];
                      return (
                        <Button
                          key={index}
                          ml="2"
                          my="1"
                          width="full"
                          variant="ghost"
                          onClick={() => {
                            clearTimeout(timer);
                            setAddress({
                              result: account.paymentAddr,
                            });
                            onClose();
                            timer = setTimeout(() => {
                              prepareTx(
                                undefined,
                                { result: account.paymentAddr },
                                0
                              );
                            }, 300);
                          }}
                        >
                          <Box width="full" display="flex">
                            <Box ml="-1">
                              <AvatarLoader
                                width="30px"
                                avatar={account.avatar}
                              />
                            </Box>
                            <Box ml="4" display="flex" flexDirection="column">
                              <Text
                                fontWeight="bold"
                                fontSize="13"
                                textAlign="left"
                              >
                                {account.name}
                              </Text>
                              <Box
                                width="220px"
                                fontSize="11"
                                textAlign="left"
                                whiteSpace="nowrap"
                                fontWeight="normal"
                              >
                                <MiddleEllipsis>
                                  <span>{account.paymentAddr}</span>
                                </MiddleEllipsis>
                              </Box>
                            </Box>
                          </Box>
                        </Button>
                      );
                    })}{' '}
                </>
              )}
            </Box>
          </Scrollbars>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

// Asset Popup

const CustomScrollbars = ({ onScroll, forwardedRef, style, children }) => {
  const refSetter = React.useCallback((scrollbarsRef) => {
    if (scrollbarsRef) {
      forwardedRef(scrollbarsRef.view);
    } else {
      forwardedRef(null);
    }
  }, []);

  return (
    <Scrollbars
      ref={refSetter}
      style={{ ...style, overflow: 'hidden', marginRight: 4 }}
      onScroll={onScroll}
    >
      {children}
    </Scrollbars>
  );
};

const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => (
  <CustomScrollbars {...props} forwardedRef={ref} />
));

let clicked = false;
const AssetsSelector = ({ assets, setValue, value }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = React.useState('');
  const select = React.useRef(false);
  const [choice, setChoice] = React.useState({});
  const hoverColor = useColorModeValue('gray.100', 'gray.600');
  // const selectColor = useColorModeValue('orange.200', 'gray.700');

  const filterAssets = () => {
    const filter1 = (asset) =>
      value.assets.every((asset2) => asset.unit !== asset2.unit);
    const filter2 = (asset) =>
      search
        ? asset.name.toLowerCase().includes(search.toLowerCase()) ||
          asset.policy.includes(search) ||
          asset.fingerprint.includes(search)
        : true;
    return assets.filter((asset) => filter1(asset) && filter2(asset));
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      matchWidth={true}
    >
      <PopoverTrigger>
        <Button
          flex={1}
          variant="ghost"
          size="sm"
          rightIcon={<ChevronDownIcon />}
        >
          Assets
        </Button>
      </PopoverTrigger>
      <PopoverContent w="98%">
        <PopoverArrow ml="4px" />
        <PopoverHeader
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <InputGroup
            width={Object.keys(choice).length <= 0 && '90%'}
            flex={Object.keys(choice).length > 0 && 3}
            size="sm"
          >
            <Input
              value={search}
              size="sm"
              variant="filled"
              rounded="md"
              placeholder="Search policy, asset, name"
              fontSize="xs"
              onInput={(e) => {
                setSearch(e.target.value);
              }}
            />
            <InputRightElement
              children={
                <SmallCloseIcon
                  cursor="pointer"
                  onClick={() => setSearch('')}
                />
              }
            />
          </InputGroup>
          {Object.keys(choice).length > 0 && (
            <>
              <Box w="2" />
              <Box
                width="100%"
                flex={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <IconButton
                  size="xs"
                  rounded="md"
                  onClick={() => setChoice({})}
                  icon={<CloseIcon />}
                />

                <Box w="3" />
                <IconButton
                  colorScheme="teal"
                  size="xs"
                  rounded="md"
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      setValue((v) => ({
                        ...v,
                        assets: v.assets.concat(
                          assets.filter((asset) => choice[asset.unit])
                        ),
                      }));
                      setChoice({});
                    }, 100);
                  }}
                  icon={<CheckIcon />}
                />
              </Box>
            </>
          )}
        </PopoverHeader>
        <PopoverBody p="-2">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            my="1"
          >
            {assets ? (
              filterAssets().length > 0 ? (
                <List
                  outerElementType={CustomScrollbarsVirtualList}
                  height={200}
                  itemCount={filterAssets().length}
                  itemSize={45}
                  width={385}
                  layout="vertical"
                >
                  {({ index, style }) => {
                    const asset = filterAssets()[index];
                    return (
                      <Box
                        style={style}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Button
                          background={choice[asset.unit] && hoverColor}
                          _hover={{
                            bgBlendMode: false,
                            bg: !choice[asset.unit] && hoverColor,
                          }}
                          width="96%"
                          onClick={() => {
                            if (clicked) return;
                            if (select.current) {
                              select.current = false;
                              return;
                            }
                            clicked = true;
                            onClose();
                            setTimeout(
                              () =>
                                setValue((v) => ({
                                  ...v,
                                  assets: v.assets.concat(asset),
                                })),
                              100
                            );

                            setTimeout(() => (clicked = false), 500); // Prevent user from selecting multiple at once
                          }}
                          mr="3"
                          ml="3"
                          display="flex"
                          alignItems="center"
                          justifyContent="start"
                          variant="ghost"
                        >
                          <Stack
                            width="100%"
                            fontSize="xs"
                            direction="row"
                            alignItems="center"
                            justifyContent="start"
                          >
                            <Selection
                              asset={asset}
                              select={select}
                              choice={choice}
                              setChoice={setChoice}
                            />

                            <Box
                              textAlign="left"
                              width="200px"
                              whiteSpace="nowrap"
                              fontWeight="normal"
                            >
                              <Box mb="-1px">
                                <MiddleEllipsis>
                                  <span>{asset.name}</span>
                                </MiddleEllipsis>
                              </Box>
                              <Box
                                whiteSpace="nowrap"
                                fontSize="xx-small"
                                fontWeight="light"
                              >
                                <MiddleEllipsis>
                                  <span>Policy: {asset.policy}</span>
                                </MiddleEllipsis>
                              </Box>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">{asset.quantity}</Text>
                            </Box>
                          </Stack>
                        </Button>
                      </Box>
                    );
                  }}
                </List>
              ) : (
                <Box
                  width={385}
                  height={200}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  opacity="0.5"
                >
                  <Planet size={80} mood="ko" color="#61DDBC" />
                  <Box height="2" />
                  <Text fontWeight="bold" color="GrayText">
                    No Assets
                  </Text>
                </Box>
              )
            ) : (
              <Box
                width={385}
                height={200}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Spinner color="teal" speed="0.5s" />
              </Box>
            )}
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const Selection = ({ select, asset, choice, setChoice }) => {
  return (
    <Box
      rounded="full"
      width="6"
      height="6"
      overflow="hidden"
      onClick={() => (select.current = true)}
    >
      {choice[asset.unit] ? (
        <Box
          width="100%"
          height="100%"
          background="orange.400"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          onClick={(e) => {
            delete choice[asset.unit];
            setChoice({ ...choice });
          }}
        >
          <CheckIcon />
        </Box>
      ) : (
        <Avatar
          onClick={(e) => {
            choice[asset.unit] = true;
            setChoice({ ...choice });
          }}
          userSelect="none"
          size="xs"
          name={asset.name}
        />
      )}
    </Box>
  );
};

export default Send;
