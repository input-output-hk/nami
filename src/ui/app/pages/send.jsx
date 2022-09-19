import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  displayUnit,
  getAccounts,
  getAdaHandle,
  getAsset,
  getCurrentAccount,
  getMilkomedaData,
  getNetwork,
  getUtxos,
  indexToHw,
  isHW,
  isValidAddress,
  isValidEthAddress,
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
  ChevronLeftIcon,
  CloseIcon,
  InfoOutlineIcon,
  SmallCloseIcon,
} from '@chakra-ui/icons';
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
  buildTx,
  initTx,
  signAndSubmit,
  signAndSubmitHW,
} from '../../../api/extension/wallet';
import {
  sumUtxos,
  valueToAssets,
  assetsToValue,
  minAdaRequired,
} from '../../../api/util';
import { FixedSizeList as List } from 'react-window';
import { useDisclosure } from '@chakra-ui/hooks';
import AssetBadge from '../components/assetBadge';
import { ERROR } from '../../../config/config';
import {
  InputRightElement,
  InputLeftElement,
  Spinner,
  Tooltip,
  useColorModeValue,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { Planet } from 'react-kawaii';
import Loader from '../../../api/loader';
import { action, useStoreActions, useStoreState } from 'easy-peasy';
import AvatarLoader from '../components/avatarLoader';
import NumberFormat from 'react-number-format';
import Copy from '../components/copy';
import AssetsModal from '../components/assetsModal';
import { MdModeEdit } from 'react-icons/md';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import useConstant from 'use-constant';

const useIsMounted = () => {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);
  return isMounted;
};

let timer = null;

const initialState = {
  fee: { fee: '0' },
  value: { ada: '', assets: [], personalAda: '', minAda: '0' },
  address: { result: '', display: '' },
  message: '',
  tx: null,
  txInfo: {
    protocolParameters: null,
    utxos: [],
    balance: { lovelace: '0', assets: null },
    milkomedaAddress: '',
  },
};

export const sendStore = {
  ...initialState,
  setFee: action((state, fee) => {
    state.fee = fee;
  }),
  setValue: action((state, value) => {
    state.value = value;
  }),
  setMessage: action((state, message) => {
    state.message = message;
  }),
  setTx: action((state, tx) => {
    state.tx = tx;
  }),
  setAddress: action((state, address) => {
    state.address = address;
  }),
  setTxInfo: action((state, txInfo) => {
    state.txInfo = txInfo;
  }),
  reset: action((state) => {
    state.fee = initialState.fee;
    state.value = initialState.value;
    state.message = initialState.message;
    state.address = initialState.address;
    state.tx = initialState.tx;
    state.txInfo = initialState.txInfo;
  }),
};

const Send = () => {
  const isMounted = useIsMounted();
  const settings = useStoreState((state) => state.settings.settings);
  const [address, setAddress] = [
    useStoreState((state) => state.globalModel.sendStore.address),
    useStoreActions((actions) => actions.globalModel.sendStore.setAddress),
  ];
  const [value, setValue] = [
    useStoreState((state) => state.globalModel.sendStore.value),
    useStoreActions((actions) => actions.globalModel.sendStore.setValue),
  ];
  const [message, setMessage] = [
    useStoreState((state) => state.globalModel.sendStore.message),
    useStoreActions((actions) => actions.globalModel.sendStore.setMessage),
  ];
  const [txInfo, setTxInfo] = [
    useStoreState((state) => state.globalModel.sendStore.txInfo),
    useStoreActions((actions) => actions.globalModel.sendStore.setTxInfo),
  ];
  const [fee, setFee] = [
    useStoreState((state) => state.globalModel.sendStore.fee),
    useStoreActions((actions) => actions.globalModel.sendStore.setFee),
  ];
  const [tx, setTx] = [
    useStoreState((state) => state.globalModel.sendStore.tx),
    useStoreActions((actions) => actions.globalModel.sendStore.setTx),
  ];

  const [txUpdate, setTxUpdate] = React.useState(false);
  const triggerTxUpdate = (stateChange) => {
    stateChange();
    setTxUpdate((update) => !update);
  };

  const utxos = React.useRef(null);
  const assets = React.useRef({});
  const account = React.useRef(null);
  const resetState = useStoreActions(
    (actions) => actions.globalModel.sendStore.reset
  );
  const history = useHistory();
  const toast = useToast();
  const ref = React.useRef();
  const [isLoading, setIsLoading] = React.useState(true);
  const focus = React.useRef(false);
  const background = useColorModeValue('gray.100', 'gray.600');

  const network = React.useRef();
  const assetsModalRef = React.useRef();

  const prepareTx = async (count, data) => {
    if (!isMounted.current) return;
    await Loader.load();
    await new Promise((res, rej) => {
      const interval = setInterval(() => {
        if (utxos.current) {
          clearInterval(interval);
          res();
          return;
        }
      });
    });
    const _value = data.value;
    const _address = data.address;
    const _message = data.message;
    if (!_value.ada && _value.assets.length <= 0) {
      setFee({ fee: '0' });
      setTx(null);
      return;
    }
    if (
      _address.error ||
      !_address.result ||
      (!_value.ada && _value.assets.length <= 0) ||
      (address.isM1 &&
        BigInt(toUnit(_value.ada)) <
          BigInt(address.ada.minLovelace) +
            BigInt(address.ada.fromADAFeeLovelace))
    ) {
      setFee({ fee: '0' });
      setTx(null);
      return;
    }
    if (count >= 5) {
      setFee({ error: 'Transaction not possible' });
      throw ERROR.txNotPossible;
    }

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
        if (
          !asset.input ||
          BigInt(toUnit(asset.input, asset.decimals) || '0') < 1
        ) {
          setFee({ error: 'Asset quantity not set' });
          return;
        }
        output.amount.push({
          unit: asset.unit,
          quantity: toUnit(asset.input, asset.decimals),
        });
      }

      const checkOutput = Loader.Cardano.TransactionOutput.new(
        _address.isM1
          ? Loader.Cardano.Address.from_bech32(_address.result)
          : Loader.Cardano.Address.from_bytes(
              await isValidAddress(_address.result)
            ),
        await assetsToValue(output.amount)
      );
      const minAda = await minAdaRequired(
        checkOutput,
        Loader.Cardano.BigNum.from_str(
          txInfo.protocolParameters.coinsPerUtxoWord
        )
      );

      if (BigInt(minAda) <= BigInt(toUnit(_value.personalAda || '0'))) {
        const displayAda = parseFloat(
          _value.personalAda.replace(/[,\s]/g, '')
        ).toLocaleString('en-EN', { minimumFractionDigits: 6 });
        output.amount[0].quantity = toUnit(_value.personalAda || '0');
        !focus.current && setValue({ ...value, ada: displayAda });
      } else if (_value.assets.length > 0) {
        output.amount[0].quantity = minAda;
        const minAdaDisplay = parseFloat(
          displayUnit(minAda).toString().replace(/[,\s]/g, '')
        ).toLocaleString('en-EN', { minimumFractionDigits: 6 });
        setValue({
          ...value,
          ada: minAdaDisplay,
        });
      }

      if (BigInt(minAda) > BigInt(output.amount[0].quantity || '0')) {
        setFee({ error: 'Transaction not possible' });
        return;
      }

      const outputs = Loader.Cardano.TransactionOutputs.new();
      outputs.add(
        Loader.Cardano.TransactionOutput.new(
          _address.isM1
            ? Loader.Cardano.Address.from_bech32(_address.result)
            : Loader.Cardano.Address.from_bytes(
                await isValidAddress(_address.result)
              ),
          await assetsToValue(output.amount)
        )
      );

      const auxiliaryData = Loader.Cardano.AuxiliaryData.new();
      const generalMetadata = Loader.Cardano.GeneralTransactionMetadata.new();

      // setting metadata for MilkomedaM1
      if (_address.isM1) {
        const ethAddress = _address.display;
        if (!isValidEthAddress(ethAddress))
          throw new Error('Not a valid ETH address');
        generalMetadata.insert(
          Loader.Cardano.BigNum.from_str('87'),
          Loader.Cardano.encode_json_str_to_metadatum(
            JSON.stringify(_address.protocolMagic),
            0
          )
        );
        generalMetadata.insert(
          Loader.Cardano.BigNum.from_str('88'),
          Loader.Cardano.encode_json_str_to_metadatum(
            JSON.stringify(ethAddress),
            0
          )
        );
      }

      // setting metadata for optional message (CIP-0020)
      if (_message) {
        function chunkSubstr(str, size) {
          const numChunks = Math.ceil(str.length / size);
          const chunks = new Array(numChunks);

          for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substr(o, size);
          }

          return chunks;
        }
        const msg = { msg: chunkSubstr(_message, 64) };
        generalMetadata.insert(
          Loader.Cardano.BigNum.from_str('674'),
          Loader.Cardano.encode_json_str_to_metadatum(JSON.stringify(msg), 1)
        );
      }

      if (generalMetadata.len() > 0) {
        auxiliaryData.set_metadata(generalMetadata);
      }

      const tx = await buildTx(
        account.current,
        utxos.current,
        outputs,
        txInfo.protocolParameters,
        auxiliaryData.metadata() ? auxiliaryData : null
      );
      setFee({ fee: tx.body().fee().to_str() });
      setTx(Buffer.from(tx.to_bytes()).toString('hex'));
    } catch (e) {
      prepareTx(count + 1, data);
    }
  };

  const init = async () => {
    if (!isMounted.current) return;
    addAssets(value.assets);
    await Loader.load();
    const currentAccount = await getCurrentAccount();
    const _network = await getNetwork();
    network.current = _network;
    account.current = currentAccount;
    if (txInfo.protocolParameters) {
      const _utxos = txInfo.utxos.map((utxo) =>
        Loader.Cardano.TransactionUnspentOutput.from_bytes(
          Buffer.from(utxo, 'hex')
        )
      );
      utxos.current = _utxos;
      setIsLoading(false);
      return;
    }
    let _utxos = await getUtxos();
    const protocolParameters = await initTx();

    const checkOutput = Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bech32(currentAccount.paymentAddr),
      Loader.Cardano.Value.zero()
    );
    const minUtxo = await minAdaRequired(
      checkOutput,
      Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
    );
    protocolParameters.minUtxo = minUtxo;

    const utxoSum = await sumUtxos(_utxos);
    let balance = await valueToAssets(utxoSum);
    balance = {
      lovelace: balance.find((v) => v.unit === 'lovelace').quantity,
      assets: balance.filter((v) => v.unit !== 'lovelace'),
    };
    utxos.current = _utxos;
    _utxos = _utxos.map((utxo) => Buffer.from(utxo.to_bytes()).toString('hex'));
    const { current_address: milkomedaAddress } = await getMilkomedaData('');
    if (!isMounted.current) return;
    setIsLoading(false);
    setTxInfo({ protocolParameters, utxos: _utxos, balance, milkomedaAddress });
  };

  const objectToArray = (obj) => Object.keys(obj).map((key) => obj[key]);

  const addAssets = (_assets) => {
    _assets.forEach((asset) => {
      assets.current[asset.unit] = { ...asset };
    });
    const assetsList = objectToArray(assets.current);
    triggerTxUpdate(() => setValue({ ...value, assets: assetsList }));
  };

  const removeAllAssets = () => {
    assets.current = {};
    triggerTxUpdate(() => setValue({ ...value, assets: [] }));
  };

  const removeAsset = (asset) => {
    delete assets.current[asset.unit];
    const assetsList = objectToArray(assets.current);
    triggerTxUpdate(() => setValue({ ...value, assets: assetsList }));
  };

  React.useEffect(() => {
    if (txInfo.protocolParameters) {
      clearTimeout(timer);
      setTx(null);
      setFee({ fee: '' });
      timer = setTimeout(() => prepareTx(0, { value, address, message }), 500);
    }
  }, [txUpdate]);

  React.useEffect(() => {
    init();
    return () => {
      resetState();
    };
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
        {txInfo.protocolParameters && isLoading ? (
          <Box
            height="100vh"
            width="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner color="teal" speed="0.5s" />
          </Box>
        ) : (
          <>
            <Account />
            <Box position="absolute" top="24" left="6">
              <IconButton
                rounded="md"
                onClick={() => {
                  history.goBack();
                }}
                variant="ghost"
                icon={<ChevronLeftIcon boxSize="6" />}
              />
            </Box>
            <Box height="10" />
            <Text fontSize="lg" fontWeight="bold">
              Send
            </Text>
            <Box height="8" />
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
                removeAllAssets={removeAllAssets}
                triggerTxUpdate={triggerTxUpdate}
                txInfo={txInfo}
                isLoading={isLoading}
              />
              {address.error && (
                <Text
                  mb={-2}
                  mt={1}
                  width="full"
                  textAlign="left"
                  color="red.300"
                >
                  {address.error}
                </Text>
              )}
              {!address.error && address.isM1 && (
                <Box
                  mb={-2}
                  mt={1}
                  width="full"
                  display="flex"
                  alignItems="center"
                >
                  <Box>Milkomeda Mode</Box>{' '}
                  <Tooltip
                    offset={[40, 8]}
                    hasArrow
                    label="Transfer ADA from your Cardano wallet to an address on Milkomeda."
                  >
                    <InfoOutlineIcon ml="1" cursor="help" />
                  </Tooltip>
                </Box>
              )}
              <Box height="5" />
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
              >
                <InputGroup size="sm" flex={3}>
                  <InputLeftElement
                    children={
                      <Box pl={4}>
                        {!isLoading ? (
                          <Box>{settings.adaSymbol}</Box>
                        ) : (
                          <Spinner
                            color="teal"
                            speed="0.5s"
                            boxSize="9px"
                            size="xs"
                          />
                        )}
                      </Box>
                    }
                  />
                  <NumberFormat
                    pl="10"
                    allowNegative={false}
                    thousandsGroupStyle="thousand"
                    value={value.ada}
                    decimalSeparator="."
                    displayType="input"
                    type="text"
                    thousandSeparator={true}
                    fixedDecimalScale={true}
                    decimalScale={6}
                    onInput={(e) => {
                      const val = e.target.value;
                      value.ada = val;
                      value.personalAda = val;
                      const v = value;
                      triggerTxUpdate(() =>
                        setValue({
                          ...v,
                        })
                      );
                    }}
                    variant="filled"
                    isDisabled={isLoading}
                    isInvalid={
                      value.ada &&
                      (address.isM1
                        ? BigInt(toUnit(value.ada)) <
                          BigInt(address.ada.minLovelace) +
                            BigInt(address.ada.fromADAFeeLovelace) // milkomeda requires a minimium ada amount which is higher than the Cardano protocol min ada
                        : BigInt(toUnit(value.ada)) <
                            BigInt(txInfo.protocolParameters.minUtxo) ||
                          BigInt(toUnit(value.ada)) >
                            BigInt(txInfo.balance.lovelace || '0'))
                    }
                    onFocus={() => (focus.current = true)}
                    placeholder="0.000000"
                    customInput={Input}
                  />
                </InputGroup>
                <Box w={4} />
                <AssetsSelector
                  addAssets={addAssets}
                  assets={txInfo.balance.assets}
                  setValue={setValue}
                  value={value}
                  isM1={address.isM1}
                />
              </Stack>
              <Box height="4" />
              <Box
                width={'96%'}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
              >
                <InputGroup size="sm">
                  <InputLeftElement children={<Icon as={MdModeEdit} />} />
                  <Input
                    value={message}
                    onInput={(e) => {
                      const msg = e.target.value;
                      triggerTxUpdate(() => setMessage(msg));
                    }}
                    size={'sm'}
                    variant={'flushed'}
                    placeholder="Optional message"
                    fontSize={'xs'}
                  />
                </InputGroup>
              </Box>
              <Box height="4" />
              <Scrollbars
                style={{
                  width: '100%',
                  height: '200px',
                }}
              >
                <Box
                  display="flex"
                  width="full"
                  flexWrap="wrap"
                  paddingRight="2"
                >
                  {value.assets.map((asset, index) => (
                    <Box key={index}>
                      <AssetBadge
                        onRemove={() => {
                          removeAsset(asset);
                        }}
                        onLoad={(decimals) => {
                          if (!assets.current[asset.unit]) return;
                          assets.current[asset.unit].decimals = decimals;
                        }}
                        onInput={async (val) => {
                          if (!assets.current[asset.unit]) return;
                          assets.current[asset.unit].input = val;
                          const v = value;
                          v.assets = objectToArray(assets.current);
                          triggerTxUpdate(() =>
                            setValue({ ...v, assets: v.assets })
                          );
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
              bottom="3"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Button
                isLoading={
                  !fee.fee &&
                  !fee.error &&
                  address.result &&
                  !address.error &&
                  (value.ada || value.assets.length > 0)
                }
                width={'366px'}
                height={'50px'}
                isDisabled={!tx || !address.result || fee.error}
                colorScheme="orange"
                onClick={() => ref.current.openModal(account.current.index)}
              >
                {fee.error ? fee.error : 'Send'}
              </Button>
            </Box>
          </>
        )}
      </Box>
      <AssetsModal ref={assetsModalRef} />
      <ConfirmModal
        title={'Confirm transaction'}
        info={
          <Box
            width={'full'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            flexDirection={'column'}
          >
            <UnitDisplay
              fontSize="2xl"
              fontWeight="medium"
              hide
              quantity={toUnit(value.ada, 6)}
              decimals={6}
              symbol={'₳'}
            />
            {value.assets.length > 0 && (
              <Button
                mt={1}
                size={'xs'}
                onClick={() =>
                  assetsModalRef.current.openModal({
                    userInput: true,
                    assets: value.assets.map((asset) => ({
                      ...asset,
                      quantity: toUnit(asset.input, asset.decimals),
                    })),
                    background: 'red.400',
                    color: 'white',
                    title: (
                      <Box>
                        Sending{' '}
                        <Box as={'span'} color={'red.400'}>
                          {value.assets.length}
                        </Box>{' '}
                        {value.assets.length == 1 ? 'asset' : 'assets'}
                      </Box>
                    ),
                  })
                }
              >
                + {value.assets.length}{' '}
                {value.assets.length > 1 ? 'Assets' : 'Asset'}
              </Button>
            )}
            <Box h={3} />
            <Box fontSize={'sm'}>to</Box>
            <Box h={2} />
            <Box
              position={'relative'}
              background={background}
              rounded={'xl'}
              p={2}
            >
              {' '}
              <Copy label="Copied address" copy={address.result}>
                <Box
                  width="180px"
                  whiteSpace="nowrap"
                  fontWeight="normal"
                  textAlign={'center'}
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  flexDirection={'column'}
                >
                  <MiddleEllipsis>
                    <span style={{ cursor: 'pointer' }}>{address.result}</span>
                  </MiddleEllipsis>
                </Box>
              </Copy>
            </Box>
            <Box h={4} />
            <Box
              width={'full'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              fontSize={'sm'}
            >
              <UnitDisplay quantity={fee.fee} decimals={6} symbol={'₳'} />{' '}
              <Box ml={1} fontWeight={'medium'}>
                fee
              </Box>
            </Box>
            {address.isM1 && (
              <>
                <Box h={4} />
                <Box fontWeight={'bold'} fontSize={'sm'}>
                  Sending to Milkomeda ⚠️
                </Box>
              </>
            )}
            <Box h={6} />
          </Box>
        }
        ref={ref}
        sign={async (password, hw) => {
          await Loader.load();
          const txDes = Loader.Cardano.Transaction.from_bytes(
            Buffer.from(tx, 'hex')
          );
          if (hw)
            return await signAndSubmitHW(txDes, {
              keyHashes: [account.current.paymentKeyHash],
              account: account.current,
              hw,
            });
          else
            return await signAndSubmit(
              txDes,
              {
                accountIndex: account.current.index,
                keyHashes: [account.current.paymentKeyHash],
              },
              password
            );
        }}
        onConfirm={async (status, signedTx) => {
          if (status === true) {
            toast({
              title: 'Transaction submitted',
              status: 'success',
              duration: 5000,
            });
            if (await isValidAddress(address.result))
              await updateRecentSentToAddress(address.result);
          } else if (signedTx === ERROR.fullMempool) {
            toast({
              title: 'Transaction failed',
              description: 'Mempool full. Try again.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
            ref.current.closeModal();
            return; // don't go back to home screen. let user try to submit same tx again
          } else
            toast({
              title: 'Transaction failed',
              status: 'error',
              duration: 3000,
            });
          ref.current.closeModal();
          setTimeout(() => {
            history.goBack();
          }, 200);
        }}
      />
    </>
  );
};

// Address Popup
const AddressPopup = ({
  setAddress,
  address,
  triggerTxUpdate,
  removeAllAssets,
  txInfo,
  isLoading,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const checkColor = useColorModeValue('teal.500', 'teal.200');
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

  const milkomedaAddress = React.useRef(txInfo.milkomedaAddress);

  React.useEffect(() => {
    milkomedaAddress.current = txInfo.milkomedaAddress;
  }, [txInfo]);

  const handleInput = async (e) => {
    const val = e.target.value;
    let addr;
    let isHandle = false;
    let isM1 = false;
    if (!e.target.value) {
      addr = { result: '', display: '' };
    } else if (val.startsWith('$')) {
      isHandle = true;
      addr = { display: val };
    } else if (val.startsWith('0x')) {
      if (isValidEthAddress(val)) {
        isM1 = true;
        addr = {
          display: val,
          isM1: true,
          ada: {
            minLovelace: '2000000',
            fromADAFeeLovelace: '500000',
          },
        };
      } else {
        addr = {
          result: val,
          display: val,
          isM1: true,
          ada: {
            minLovelace: '2000000',
            fromADAFeeLovelace: '500000',
          },
          error: 'Address is invalid (Milkomeda)',
        };
      }
    } else if (
      (await isValidAddress(val)) &&
      val !== milkomedaAddress.current
    ) {
      addr = { result: val, display: val };
    } else {
      addr = {
        result: val,
        display: val,
        error: 'Address is invalid',
      };
    }

    if (isHandle) {
      const handle = e.target.value;
      const resolvedAddress = await getAdaHandle(handle.slice(1));
      if (handle.length > 1 && (await isValidAddress(resolvedAddress))) {
        addr = {
          result: resolvedAddress,
          display: e.target.value,
        };
      } else {
        addr = {
          result: '',
          display: e.target.value,
          error: '$handle not found',
        };
      }
    } else if (isM1) {
      const { isAllowed, ada, current_address, protocolMagic, assets, ttl } =
        await getMilkomedaData(e.target.value);

      if (!isAllowed || !isValidEthAddress(e.target.value)) {
        addr = {
          result: '',
          display: e.target.value,
          isM1: true,
          ada,
          ttl,
          protocolMagic,
          assets,
          error: 'Address is invalid (Milkomeda)',
        };
      } else {
        addr = {
          result: current_address,
          display: e.target.value,
          isM1: true,
          ada,
          ttl,
          protocolMagic,
          assets,
        };
      }
    }
    return addr;
  };

  const handleInputDebounced = useConstant(() =>
    AwesomeDebouncePromise(handleInput, 300)
  );

  React.useEffect(() => {
    init();
  }, []);
  return (
    <Popover
      isOpen={
        state.currentAccount &&
        (state.recentAddress ||
          Object.keys(state.accounts).filter(
            (index) => index != state.currentAccount.index
          ).length > 0) &&
        isOpen
      }
      onOpen={() => !isLoading && !address.result && !address.error && onOpen()}
      autoFocus={false}
      onClose={async () => {
        await new Promise((res, rej) => setTimeout(() => res()));
        if (ref.current) {
          ref.current = false;
          return;
        }
        onClose();
      }}
      gutter={1}
    >
      <PopoverTrigger>
        <InputGroup>
          <Input
            disabled={isLoading}
            variant="filled"
            autoComplete="off"
            value={address.display}
            spellCheck={false}
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
            placeholder="Address, $handle or Milkomeda"
            onInput={async (e) => {
              setAddress({ display: e.target.value });
              const addr = await handleInputDebounced(e);
              if (addr.isM1) removeAllAssets();
              triggerTxUpdate(() => setAddress(addr));
              onClose();
            }}
            isInvalid={address.error}
          />
          {address.result && !address.error && (
            <InputRightElement
              children={<CheckIcon boxSize="3" color={checkColor} />}
            />
          )}
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent
        onClick={() => {
          ref.current = false;
        }}
        onFocus={() => {
          ref.current = true;
        }}
        _focus={{ outline: 'none' }}
      >
        <PopoverBody pr="-2">
          <Scrollbars
            style={{ width: '100%', overflowX: 'hidden' }}
            autoHeight
            autoHeightMax={240}
          >
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
                    const address = state.recentAddress;
                    if (address == milkomedaAddress.current) {
                      triggerTxUpdate(() =>
                        setAddress({
                          result: '',
                          display: address,
                          error:
                            'Disallowed sending directly to Milkomeda stargate',
                        })
                      );
                      onClose();
                      return;
                    }

                    triggerTxUpdate(() =>
                      setAddress({
                        result: address,
                        display: address,
                      })
                    );
                    onClose();
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
              ).length > 0 && (
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
                            const addr = account.paymentAddr;

                            triggerTxUpdate(() =>
                              setAddress({
                                result: addr,
                                display: addr,
                              })
                            );
                            onClose();
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

const AssetsSelector = ({ assets, addAssets, value, isM1 }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = React.useState('');
  const select = React.useRef(false);
  const [choice, setChoice] = React.useState({});

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

  React.useEffect(() => {
    if (isM1) onClose();
  }, [isM1]);

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      matchWidth={true}
    >
      <PopoverTrigger>
        <Button
          isDisabled={isM1 || !assets || assets.length < 1}
          flex={1}
          size="sm"
        >
          + Assets
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
                      addAssets(assets.filter((asset) => choice[asset.unit]));
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
                        <Asset
                          asset={asset}
                          setChoice={setChoice}
                          choice={choice}
                          select={select}
                          onClose={onClose}
                          addAssets={addAssets}
                        />
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

const Asset = ({ asset, choice, select, setChoice, onClose, addAssets }) => {
  const [token, setToken] = React.useState(null);
  const isMounted = useIsMounted();
  const hoverColor = useColorModeValue('gray.100', 'gray.600');

  const fetchData = async () => {
    const detailedAsset = {
      ...(await getAsset(asset.unit)),
      quantity: asset.quantity,
    };
    if (!isMounted.current) return;
    setToken(detailedAsset);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <Button
      background={choice[asset.unit] && hoverColor}
      _hover={{
        bgBlendMode: false,
        bg: !choice[asset.unit] && hoverColor,
      }}
      width="96%"
      onClick={() => {
        if (select.current) {
          select.current = false;
          return;
        }
        onClose();
        addAssets([asset]);
      }}
      mr="3"
      ml="4"
      display="flex"
      alignItems="center"
      justifyContent="start"
      variant="ghost"
    >
      {token && (
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
                <span>{token.name}</span>
              </MiddleEllipsis>
            </Box>
            <Box whiteSpace="nowrap" fontSize="xx-small" fontWeight="light">
              <MiddleEllipsis>
                <span>Policy: {token.policy}</span>
              </MiddleEllipsis>
            </Box>
          </Box>
          <Box>
            <UnitDisplay quantity={token.quantity} decimals={token.decimals} />
          </Box>
        </Stack>
      )}
    </Button>
  );
};

const Selection = ({ select, asset, choice, setChoice }) => {
  const selectColor = useColorModeValue('orange.500', 'orange.200');
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
          background={selectColor}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color={selectColor === 'orange.200' ? 'black' : 'white'}
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
