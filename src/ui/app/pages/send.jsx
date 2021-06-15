import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  displayUnit,
  getCurrentAccount,
  getUtxos,
  isValidAddress,
  signData,
  toUnit,
} from '../../../api/extension';
import { Box, Stack, Text } from '@chakra-ui/layout';
import Account from '../components/account';
import Scrollbars from 'react-custom-scrollbars';
import { Button, IconButton } from '@chakra-ui/button';
import ConfirmModal from '../components/confirmModal';
import { ChevronDownIcon, ChevronLeftIcon, Icon } from '@chakra-ui/icons';
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
import Copy from '../components/copy';
import MiddleEllipsis from 'react-middle-ellipsis';
import { Avatar } from '@chakra-ui/avatar';
import AssetFingerprint from '@emurgo/cip14-js';
import UnitDisplay from '../components/unitDisplay';
import {
  assetsToValue,
  buildTx,
  initTx,
  minRequiredAda,
  signAndSubmit,
  structureToUtxo,
  sumUtxos,
  valueToAssets,
} from '../../../api/extension/wallet';
import { FixedSizeList as List } from 'react-window';
import { useDisclosure } from '@chakra-ui/hooks';
import Asset from '../components/asset';
import AssetBadge from '../components/assetBadge';
import { ERROR } from '../../../config/config';
import { Alert, AlertIcon, useToast } from '@chakra-ui/react';

let timer = null;

const Send = () => {
  const hexToAscii = (hex) => {
    var _hex = hex.toString();
    var str = '';
    for (var i = 0; i < _hex.length && _hex.substr(i, 2) !== '00'; i += 2)
      str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
    return str;
  };
  const history = useHistory();
  const toast = useToast();
  const ref = React.useRef();
  const [account, setAccount] = React.useState(null);
  const [fee, setFee] = React.useState({ fee: '0' });
  const [value, setValue] = React.useState({ ada: '', assets: [] });
  const [address, setAddress] = React.useState({ address: '' });
  const [txInfo, setTxInfo] = React.useState({
    protocolParameters: null,
    utxos: [],
    balance: { lovelace: '0', assets: null },
  });
  const [tx, setTx] = React.useState(null);
  const prepareTx = async (ada, assets = [], count) => {
    if (count >= 5) throw ERROR.txNotPossible;
    setFee({ fee: '' });
    setTx(null);
    await new Promise((res, rej) => setTimeout(() => res()));
    try {
      const output = {
        address: address.address,
        amount: [{ unit: 'lovelace', quantity: toUnit(ada) }],
      };
      assets.forEach((asset) =>
        output.amount.push({
          unit: asset.unit,
          quantity: toUnit(asset.quantity, 0),
        })
      );

      const tx = await buildTx(
        account,
        txInfo.utxos,
        [output],
        txInfo.protocolParameters
      );

      setFee({ fee: tx.body().fee().to_str() });
      setTx(tx);
    } catch (e) {
      if (!ada) setFee({ fee: '0' });
      else setFee({ error: 'Cannot create transaction' });
      prepareTx(ada, assets, count + 1);
    }
  };

  const getInfo = async () => {
    const currentAccount = await getCurrentAccount();
    setAccount(currentAccount);
    const utxos = await getUtxos();
    const protocolParameters = await initTx();
    const utxoSum = await sumUtxos(utxos);
    let balance = await valueToAssets(utxoSum);
    balance = {
      lovelace: balance.find((v) => v.unit === 'lovelace').quantity,
      assets: balance.filter((v) => v.unit !== 'lovelace'),
    };
    const u = await Promise.all(
      utxos.map(async (utxo) => await structureToUtxo(utxo))
    );
    setTxInfo({ protocolParameters, utxos: u, balance });
  };

  React.useEffect(() => {
    getInfo();
  }, []);
  return (
    <>
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        flexDirection="column"
        position="relative"
      >
        <Account account={account} />
        <Box position="absolute" top="24" left="6">
          <IconButton
            onClick={() => history.goBack()}
            variant="ghost"
            icon={<ChevronLeftIcon boxSize="7" />}
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
          <Input
            fontSize="xs"
            placeholder="Receiver"
            onInput={async (e) => {
              if (await isValidAddress(e.target.value))
                setAddress({ address: e.target.value });
              else
                setAddress({
                  error: 'Invalid address',
                  address: e.target.value,
                });
            }}
            isInvalid={address.address && address.error}
          />
          {address.address && address.error && (
            <Text width="full" textAlign="left" color="red.300">
              Address is invalid
            </Text>
          )}
          <Box height="4" />
          <Stack direction="row" alignItems="center" justifyContent="center">
            <InputGroup size="sm" flex={3}>
              <InputLeftAddon rounded="md" children="₳" />
              <Input
                value={value.ada}
                onInput={(e) => {
                  clearTimeout(timer);
                  console.log(e.target.value);
                  setValue((v) => ({ ...v, ada: e.target.value }));

                  timer = setTimeout(() => {
                    prepareTx(e.target.value, [], 0);
                  }, 300);
                }}
                onBlur={(e) => {
                  const ada = parseFloat(
                    e.target.value.replace(/[,\s]/g, '')
                  ).toLocaleString('en-EN', { minimumFractionDigits: 6 });
                  if (ada != 'NaN') {
                    setValue((v) => ({ ...v, ada }));
                  } else setValue((v) => ({ ...v, ada: '' }));
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
          <Box height="4" />
          <Box display="flex" width="full" flexWrap="wrap">
            {value.assets.map((asset, index) => (
              <Box
                onClick={() => {
                  value.assets.splice(value.assets.indexOf(asset), 1);
                  setValue((v) => ({ ...v, assets: value.assets }));
                }}
                key={index}
              >
                <AssetBadge asset={asset} />
              </Box>
            ))}
          </Box>
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
                <Text fontWeight="bold">Fee: </Text>
                <UnitDisplay quantity={fee.fee} decimals={6} symbol="₳" />
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
          <Button
            isDisabled={!tx}
            colorScheme="orange"
            onClick={() => ref.current.openModal()}
            rightIcon={<Icon as={BsArrowUpRight} />}
          >
            Send
          </Button>
        </Box>
      </Box>
      <ConfirmModal
        ref={ref}
        sign={(password) => signAndSubmit(tx, account, password)}
        onConfirm={async (status, signedTx) => {
          if (status === true)
            toast({
              title: 'Transaction submitted',
              status: 'success',
              duration: 5000,
            });
          else
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
      style={{ ...style, overflow: 'hidden' }}
      onScroll={onScroll}
    >
      {children}
    </Scrollbars>
  );
};

const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => (
  <CustomScrollbars {...props} forwardedRef={ref} />
));

const AssetsSelector = ({ assets, setValue, value }) => {
  const hexToAscii = (hex) => {
    var _hex = hex.toString();
    var str = '';
    for (var i = 0; i < _hex.length && _hex.substr(i, 2) !== '00'; i += 2)
      str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
    return str;
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      matchWidth={true}
      offset={[-108, 0]}
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
      <PopoverContent width="full">
        <PopoverArrow />
        <PopoverHeader
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Input
            width="90%"
            size="sm"
            variant="filled"
            rounded="md"
            placeholder="Search assets"
          />
        </PopoverHeader>
        <PopoverBody p="-2" pr="-5">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            my="1"
          >
            {assets && (
              <List
                outerElementType={CustomScrollbarsVirtualList}
                height={200}
                itemCount={
                  assets.filter((asset) =>
                    value.assets.every((asset2) => asset.unit !== asset2.unit)
                  ).length
                }
                itemSize={45}
                width={385}
                layout="vertical"
              >
                {({ index, style }) => {
                  const asset = assets.filter((asset) =>
                    value.assets.every((asset2) => asset.unit !== asset2.unit)
                  )[index];
                  return (
                    <Box
                      style={style}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Button
                        width="96%"
                        onClick={() => {
                          setValue((v) => ({
                            ...v,
                            assets: v.assets.concat(asset),
                          }));
                          onClose();
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
                          <Avatar
                            userSelect="none"
                            size="xs"
                            name={hexToAscii(asset.unit.slice(56))}
                          />

                          <Box
                            textAlign="left"
                            width="200px"
                            whiteSpace="nowrap"
                            fontWeight="normal"
                          >
                            <Box mb="-1px">
                              <MiddleEllipsis>
                                <span>{hexToAscii(asset.unit.slice(56))}</span>
                              </MiddleEllipsis>
                            </Box>
                            <Box
                              whiteSpace="nowrap"
                              fontSize="xx-small"
                              fontWeight="thin"
                            >
                              <MiddleEllipsis>
                                <span>Policy: {asset.unit.slice(0, 56)}</span>
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
            )}
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default Send;
