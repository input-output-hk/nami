import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Link, Text } from '@chakra-ui/layout';
import React from 'react';
import { updateTxInfo } from '../../../api/extension';
import UnitDisplay from './unitDisplay';
import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  VStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/spinner';
import CoinSelection from '../../../lib/coinSelection';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import ReactTimeAgo from 'react-time-ago';
import {
  TiArrowForward,
  TiArrowBack,
  TiArrowShuffle,
  TiArrowLoop,
} from 'react-icons/ti';
import {
  FaCoins,
  FaPiggyBank,
  FaTrashAlt,
  FaRegEdit,
  FaUserCheck,
} from 'react-icons/fa';
import { Button } from '@chakra-ui/button';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ReactDOMServer from 'react-dom/server';
import AssetsPopover from './assetPopoverDiff';
TimeAgo.addDefaultLocale(en);

const txTypeColor = {
  self: 'gray.500',
  internalIn: 'teal.500',
  externalIn: 'teal.500',
  internalOut: 'orange.500',
  externalOut: 'orange.500',
  withdrawal: 'yellow.400',
  delegation: 'purple.500',
  stake: 'cyan.700',
  poolUpdate: 'green.400',
  poolRetire: 'red.500',
};

const txTypeLabel = {
  withdrawal: 'Withdrawal',
  delegation: 'Delegation',
  stake: 'Stake Registration',
  poolUpdate: 'Pool Update',
  poolRetire: 'Pool Retire',
};

const Transaction = ({ txHash, details, currentAddr, addresses, assets }) => {
  let detail = details[txHash];
  const [displayInfo, setDisplayInfo] = React.useState({});

  const colorMode = {
    iconBg: useColorModeValue('white', 'gray.800'),
    txBg: useColorModeValue('teal.50', 'gray.700'),
    txBgHover: useColorModeValue('teal.100', 'gray.600'),
    assetsBtnHover: useColorModeValue('teal.200', 'gray.700'),
  };

  const getTxDetail = async () => {
    if (!details) {
      return;
    }

    if (!detail) {
      detail = details[txHash] = {};
      await updateTxInfo(txHash, detail);
      setDisplayInfo(
        genDisplayInfo(txHash, detail, currentAddr, addresses, assets)
      );
    }
  };

  React.useEffect(() => getTxDetail(), [displayInfo]);

  return (
    <AccordionItem borderTop="none" _last={{ borderBottom: 'none' }}>
      {Object.keys(displayInfo).length < 1 ? (
        <Box mt="28" display="flex" alignItems="center" justifyContent="center">
          <Spinner color="teal" speed="0.5s" />
        </Box>
      ) : (
        <VStack spacing={2}>
          <Box align="center" fontSize={14} fontWeight={500} color="gray.500">
            <ReactTimeAgo
              date={displayInfo.date}
              title={displayInfo.formatDate}
              locale="en-US"
              timeStyle="round-minute"
            />
          </Box>
          <AccordionButton
            display="flex"
            wordBreak="break-word"
            justifyContent="space-between"
            bg={colorMode.txBg}
            borderRadius={10}
            borderLeftRadius={30}
            shadow="base"
            p={0}
            _hover={{ backgroundColor: colorMode.txBgHover }}
            _focus={{ border: 'none' }}
          >
            <Box
              display="flex"
              flexShrink={5}
              p={5}
              borderRadius={50}
              bg={colorMode.iconBg}
              position="relative"
              left="-15px"
            >
              <TxIcon txType={displayInfo.type} extra={displayInfo.extra} />
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              textAlign="center"
              position="relative"
              left="-15px"
            >
              {displayInfo.lovelace ? (
                <Text fontSize={18}>
                  <UnitDisplay
                    color={txTypeColor[displayInfo.type]}
                    quantity={displayInfo.lovelace.quantity}
                    decimals={6}
                    symbol="₳"
                  />
                </Text>
              ) : displayInfo.extra.length ? (
                <Text fontSize={12} fontWeight="semibold" color="teal.500">
                  {getTxExtra(displayInfo.extra)}
                </Text>
              ) : (
                ''
              )}

              <Text flexDirection="row" fontSize={12}>
                Fee:{' '}
                <UnitDisplay
                  display="inline-block"
                  quantity={detail.info.fees}
                  decimals={6}
                  symbol="₳"
                />
                {parseInt(detail.info.deposit) ? (
                  <>
                    {' & Deposit: '}
                    <UnitDisplay
                      display="inline-block"
                      quantity={detail.info.deposit}
                      decimals={6}
                      symbol="₳"
                    />
                  </>
                ) : (
                  ''
                )}
              </Text>
              {displayInfo.assets.length > 0 ? (
                <Box flexDirection="row" fontSize={12}>
                  <Text
                    display="inline-block"
                    fontWeight="bold"
                    _hover={{ backgroundColor: colorMode.assetsBtnHover }}
                    borderRadius="md"
                  >
                    <AssetsPopover assets={displayInfo.assets} />
                  </Text>
                </Box>
              ) : (
                ''
              )}
            </Box>
            <AccordionIcon color="teal.400" mr={5} fontSize={20} />
          </AccordionButton>
          <AccordionPanel wordBreak="break-word" pb={4}>
            <TxDetail displayInfo={displayInfo} />
          </AccordionPanel>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box
              _before={{ content: '" "' }}
              w={5}
              h={5}
              mb={1}
              borderColor="teal.400"
              borderWidth={5}
              borderRadius={50}
            ></Box>
            <Box
              _before={{ content: '" "' }}
              w={1}
              h={8}
              bg="orange.500"
              mb={2}
            ></Box>
          </Box>
        </VStack>
      )}
    </AccordionItem>
  );
};

const TxIcon = ({ txType, extra }) => {
  const icons = {
    self: TiArrowLoop,
    internalIn: TiArrowShuffle,
    externalIn: TiArrowForward,
    internalOut: TiArrowShuffle,
    externalOut: TiArrowBack,
    withdrawal: FaCoins,
    delegation: FaPiggyBank,
    stake: FaUserCheck,
    poolUpdate: FaRegEdit,
    poolRetire: FaTrashAlt,
  };

  if (extra.length) txType = extra[0];

  let style;
  switch (txType) {
    case 'externalIn':
      style = { transform: 'rotate(90deg)' };
      break;
    case 'internalOut':
      style = { transform: 'rotate(180deg)' };
      break;
    default:
      style = {};
  }

  return (
    <Icon
      as={icons[txType]}
      style={style}
      w={8}
      h={8}
      color={txTypeColor[txType]}
    />
  );
};

const TxDetail = ({ displayInfo }) => {
  const colorMode = {
    extraDetail: useColorModeValue('black', 'white'),
  };

  return (
    <>
      <Box display="flex" flexDirection="horizontal">
        <Box>
          <Box
            display="flex"
            flexDirection="vertical"
            color="gray.600"
            fontSize="sm"
            fontWeight="bold"
          >
            Transaction ID
          </Box>
          <Box>
            <Link
              color="teal"
              href={'https://cardanoscan.io/transaction/' + displayInfo.txHash}
              isExternal
            >
              {displayInfo.txHash} <ExternalLinkIcon mx="2px" />
            </Link>
            {displayInfo.detail.metadata.length > 0 ? (
              <Button
                display="inline-block"
                colorScheme="orange"
                size="xs"
                fontSize="10px"
                p="2px 4px"
                height="revert"
                m="0 5px"
                onClick={() => viewMetadata(displayInfo.detail.metadata)}
              >
                See Metadata
              </Button>
            ) : (
              ''
            )}
          </Box>
        </Box>
        <Box>
          <Box
            display="flex"
            flexDirection="vertical"
            textAlign="right"
            pl="10px"
            color="gray.500"
            fontSize="xs"
            fontWeight="400"
            minWidth="75px"
          >
            {displayInfo.timestamp}
          </Box>
        </Box>
      </Box>
      {displayInfo.extra.length > 0 ? (
        <Box display="flex" flexDirection="vertical" mt="10px">
          <Box>
            <Box color="gray.600" fontSize="sm" fontWeight="bold">
              Transaction Extra
            </Box>
            <Box>
              <Text
                fontSize={12}
                fontWeight="semibold"
                color={colorMode.extraDetail}
              >
                {getTxExtra(displayInfo.extra)}
              </Text>
            </Box>
          </Box>
        </Box>
      ) : (
        ''
      )}
    </>
  );
};

const genDisplayInfo = (txHash, detail, currentAddr, addresses, assets) => {
  if (!detail.info || !detail.utxos) return;

  const type = getTxType(currentAddr, addresses, detail.utxos);
  const date = dateFromUnix(detail.block.time);
  const amounts = calculateAmount(type, currentAddr, detail.utxos);

  return {
    txHash: txHash,
    detail: detail,
    date: date,
    timestamp: getTimestamp(date),
    type: type,
    extra: getExtra(detail.info),
    amounts: amounts,
    lovelace: amounts.find((amount) => amount.unit === 'lovelace'),
    assets: assets.filter((asset) =>
      amounts.some((amount) => amount.unit === asset.unit)
    ),
  };
};

const getTxType = (currentAddr, addresses, uTxOList) => {
  let inputsAddr = uTxOList.inputs.map((utxo) => utxo.address);
  let outputsAddr = uTxOList.outputs.map((utxo) => utxo.address);

  return inputsAddr.includes(currentAddr)
    ? outputsAddr.every((addr) => addr === currentAddr)
      ? 'self'
      : outputsAddr.some(
          (addr) => addresses.includes(addr) && addr !== currentAddr
        )
      ? 'internalOut'
      : 'externalOut'
    : inputsAddr.some((addr) => addresses.includes(addr))
    ? 'internalIn'
    : 'externalIn';
};

const dateFromUnix = (unixTimestamp) => {
  return new Date(unixTimestamp * 1000);
};

const getTimestamp = (date) => {
  const zeroLead = (str) => ('0' + str).slice(-2);

  return `${date.getFullYear()}-${zeroLead(date.getMonth())}-${zeroLead(
    date.getDate()
  )} ${zeroLead(date.getHours())}:${zeroLead(date.getMinutes())}:${zeroLead(
    date.getSeconds()
  )}`;
};

const calculateAmount = (txType, currentAddr, uTxOList) => {
  const outputs = ['internalIn', 'externalIn'].includes(txType)
    ? uTxOList.outputs.filter((utxo) => utxo.address === currentAddr)
    : uTxOList.outputs.filter((utxo) => utxo.address !== currentAddr);

  return CoinSelection.compileOutputs(outputs);
};

const getExtra = (info, txType) => {
  let extra = [];
  if (info.withdrawal_count && txType === 'internalIn')
    extra.push('withdrawal');
  if (info.delegation_count) extra.push('delegation');
  if (info.stake_cert_count) extra.push('stake');
  if (info.pool_retire_count) extra.push('poolRetire');
  if (info.pool_update_count) extra.push('poolUpdate');

  return extra;
};

const viewMetadata = (metadata) => {
  const HighlightJson = () => (
    <html lang="en">
      <head>
        <title>Metadata</title>
      </head>
      <body style={{ backgroundColor: '#2b2b2b' }}>
        <SyntaxHighlighter
          language="json"
          style={a11yDark}
          customStyle={{ fontSize: '14px', lineHeight: '20px' }}
        >
          {JSON.stringify(metadata, null, 2)}
        </SyntaxHighlighter>
      </body>
    </html>
  );
  var newTab = window.open();
  newTab.document.write(ReactDOMServer.renderToString(<HighlightJson />));
  newTab.document.close();
};

const getTxExtra = (extra) =>
  extra.map((item, index, array) =>
    index < array.length - 1 ? txTypeLabel[item] + ', ' : txTypeLabel[item]
  );

export default Transaction;
