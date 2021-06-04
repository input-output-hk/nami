import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  displayUnit,
  getCurrentAccount,
  getUtxos,
  signData,
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
  const [assets, setAssets] = React.useState(null);
  const [fee, setFee] = React.useState('0');
  const [ada, setAda] = React.useState('');
  const getInfo = async () => {
    const currentAccount = await getCurrentAccount();
    setAccount(currentAccount);
    const utxos = await getUtxos();
    console.log(utxos);
    setAssets(sumUtxos(utxos));
  };

  const sumUtxos = (utxos) => {
    const sumObject = {};
    utxos.forEach((utxo) => {
      utxo.amount.forEach((amount) => {
        if (!sumObject[amount.unit])
          sumObject[amount.unit] = BigInt(amount.quantity);
        else
          sumObject[amount.unit] =
            sumObject[amount.unit] + BigInt(amount.quantity);
      });
    });
    return Object.keys(sumObject).map((unit) => {
      const policy = unit.slice(0, 56),
        name = hexToAscii(unit.slice(56)),
        fingerprint = new AssetFingerprint(
          Buffer.from(policy, 'hex'),
          Buffer.from(name, 'hex')
        ).fingerprint();
      return {
        unit,
        quantity: sumObject[unit].toString(),
        policy,
        name,
        fingerprint,
      };
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
          <Input fontSize="xs" placeholder="Receiver" />
          <Box height="4" />
          <Stack direction="row" alignItems="center" justifyContent="center">
            <InputGroup size="sm" flex={3}>
              <InputLeftAddon rounded="lg" children="₳" />
              <Input
                value={ada}
                onChange={(e) => setAda(e.target.value)}
                onBlur={(e) => {
                  const v = parseFloat(
                    e.target.value.replace(/[,\s]/g, '')
                  ).toLocaleString('en-EN', { minimumFractionDigits: 6 });
                  if (v != 'NaN') {
                    setAda(v);
                  } else setAda('');
                }}
                placeholder="0.000000"
                rounded="lg"
              />
            </InputGroup>
            <AssetsSelector assets={assets} />
          </Stack>
        </Box>
        <Box
          position="absolute"
          width="full"
          bottom="24"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Stack direction="row" alignItems="center" justifyContent="center">
            <Text>Fee: </Text>
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
            onClick={() => ref.current.openModal()}
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

const AssetsSelector = ({ assets }) => {
  const hexToAscii = (hex) => {
    var _hex = hex.toString();
    var str = '';
    for (var i = 0; i < _hex.length && _hex.substr(i, 2) !== '00'; i += 2)
      str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
    return str;
  };
  return (
    <Popover matchWidth={true} offset={[-110, 0]}>
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
          <Scrollbars style={{ width: '100%' }} autoHeight autoHeightMax={200}>
            <Box display="flex" flexDirection="column" my="1">
              {assets &&
                assets
                  .filter((asset) => asset.unit !== 'lovelace')
                  .map((asset) => (
                    <Button
                      p="1.5"
                      mr="4"
                      ml="1"
                      my="0.5"
                      display="flex"
                      alignItems="center"
                      justifyContent="start"
                      variant="ghost"
                    >
                      <Stack
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

                        <Copy label="Copied asset" copy={asset.fingerprint}>
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
                        </Copy>

                        <Text fontWeight="bold" textAlign="center">
                          {asset.quantity}
                        </Text>
                      </Stack>
                    </Button>
                  ))}
            </Box>
          </Scrollbars>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default Send;
