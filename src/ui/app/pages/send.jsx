import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  displayUnit,
  getCurrentAccount,
  getUtxos,
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

const Send = () => {
  const hexToAscii = (hex) => {
    var _hex = hex.toString();
    var str = '';
    for (var i = 0; i < _hex.length && _hex.substr(i, 2) !== '00'; i += 2)
      str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
    return str;
  };
  const history = useHistory();
  const ref = React.useRef();
  const [account, setAccount] = React.useState(null);
  const [balance, setBalance] = React.useState({ lovelace: '0', assets: null });
  const [utxos, setUtxos] = React.useState([]);
  const [fee, setFee] = React.useState('0');
  const [value, setValue] = React.useState({ ada: '', assets: [] });
  const [address, setAddress] = React.useState('');
  const getInfo = async () => {
    const currentAccount = await getCurrentAccount();
    setAccount(currentAccount);
    const utxos = await getUtxos();
    setUtxos(utxos);
    const utxoSum = await sumUtxos(utxos);
    const balance = await valueToAssets(utxoSum);
    setBalance({
      lovelace: balance.find((v) => v.unit === 'lovelace').quantity,
      assets: balance.filter((v) => v.unit !== 'lovelace'),
    });
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
            onChange={(e) => setAddress(e.target.value)}
          />
          <Box height="4" />
          <Stack direction="row" alignItems="center" justifyContent="center">
            <InputGroup size="sm" flex={3}>
              <InputLeftAddon rounded="md" children="₳" />
              <Input
                value={value.ada}
                onChange={(e) =>
                  setValue((v) => ({ ...v, ada: e.target.value }))
                }
                onBlur={(e) => {
                  const ada = parseFloat(
                    e.target.value.replace(/[,\s]/g, '')
                  ).toLocaleString('en-EN', { minimumFractionDigits: 6 });
                  if (ada != 'NaN') {
                    setValue((v) => ({ ...v, ada }));
                  } else setValue('');
                }}
                placeholder="0.000000"
                rounded="md"
              />
            </InputGroup>
            <AssetsSelector
              assets={balance.assets}
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
            <Text fontWeight="bold">Fee: </Text>
            <UnitDisplay quantity={fee} decimals={6} symbol="₳" />
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
            colorScheme="orange"
            // onClick={() => ref.current.openModal()}
            onClick={async () => {
              const output = {
                address,
                amount: [{ unit: 'lovelace', quantity: toUnit(value.ada) }],
              };
              value.assets.forEach((asset) =>
                output.amount.push({
                  unit: asset.unit,
                  quantity: toUnit(asset.quantity, 0),
                })
              );
              const u = await Promise.all(
                utxos.map(async (utxo) => await structureToUtxo(utxo))
              );

              const protocolParameters = await initTx();
              const tx = await buildTx(
                account,
                u,
                [output],
                protocolParameters
              );
              console.log(tx);
              const txHash = await signAndSubmit(account, tx);
              console.log(txHash);
            }}
            rightIcon={<Icon as={BsArrowUpRight} />}
          >
            Send
          </Button>
        </Box>
      </Box>
      <ConfirmModal
        ref={ref}
        sign={(password) =>
          signData(
            request.data.address,
            request.data.message,
            password,
            account.index
          )
        }
        onConfirm={async (status, signedMessage) => {
          if (status === true) {
            await controller.returnData(signedMessage);
            window.close();
          }
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
