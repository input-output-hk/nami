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
  Skeleton,
} from '@chakra-ui/react';
import { compileOutputs } from '../../../api/util';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import ReactTimeAgo from 'react-time-ago';
import { Button } from '@chakra-ui/button';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ReactDOMServer from 'react-dom/server';
import AssetsPopover from './assetPopoverDiff';
import AssetFingerprint from '@emurgo/cip14-js';
import { hexToAscii } from '../../../api/util';
import { NETWORK_ID } from '../../../config/config';
import { useStoreState } from 'easy-peasy';
import {
  FaCoins,
  FaPiggyBank,
  FaTrashAlt,
  FaRegEdit,
  FaUserCheck,
  FaUsers,
  FaRegFileCode,
  IoRemoveCircleSharp,
  TiArrowForward,
  TiArrowBack,
  TiArrowShuffle,
  TiArrowLoop,
  GiAnvilImpact,
} from 'react-icons/all';

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
  unstake: 'red.400',
  poolUpdate: 'green.400',
  poolRetire: 'red.400',
  mint: 'cyan.500',
  multisig: 'pink.400',
  contract: 'teal.400',
};

const txTypeLabel = {
  withdrawal: 'Withdrawal',
  delegation: 'Delegation',
  stake: 'Stake Registration',
  unstake: 'Stake Deregistration',
  poolUpdate: 'Pool Update',
  poolRetire: 'Pool Retire',
  mint: 'Minting',
  multisig: 'Multi-signatures',
  contract: 'Contract',
};

const useIsMounted = () => {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);
  return isMounted;
};

const Transaction = ({
  txHash,
  detail,
  currentAddr,
  addresses,
  network,
  onLoad,
}) => {
  const settings = useStoreState((state) => state.settings.settings);
  const isMounted = useIsMounted();
  const [displayInfo, setDisplayInfo] = React.useState(
    genDisplayInfo(txHash, detail, currentAddr, addresses)
  );

  const colorMode = {
    iconBg: useColorModeValue('white', 'gray.800'),
    txBg: useColorModeValue('teal.50', 'gray.700'),
    txBgHover: useColorModeValue('teal.100', 'gray.600'),
    assetsBtnHover: useColorModeValue('teal.200', 'gray.700'),
  };

  const getTxDetail = async () => {
    if (!displayInfo) {
      let txDetail = await updateTxInfo(txHash);
      onLoad(txHash, txDetail);
      if (!isMounted.current) return;
      setDisplayInfo(genDisplayInfo(txHash, txDetail, currentAddr, addresses));
    }
  };

  React.useEffect(() => getTxDetail());
  return (
    <AccordionItem borderTop="none" _last={{ borderBottom: 'none' }}>
      <VStack spacing={2}>
        {displayInfo ? (
          <Box align="center" fontSize={14} fontWeight={500} color="gray.500">
            <ReactTimeAgo
              date={displayInfo.date}
              title={displayInfo.formatDate}
              locale="en-US"
              timeStyle="round-minute"
            />
          </Box>
        ) : (
          <Skeleton width="34%" height="22px" rounded="md" />
        )}
        {displayInfo ? (
          <AccordionButton
            display="flex"
            wordBreak="break-word"
            justifyContent="space-between"
            bg={colorMode.txBg}
            borderRadius={10}
            borderLeftRadius={30}
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
                <UnitDisplay
                  fontSize={18}
                  color={
                    displayInfo.lovelace >= 0
                      ? txTypeColor.externalIn
                      : txTypeColor.externalOut
                  }
                  quantity={displayInfo.lovelace}
                  decimals={6}
                  symbol={settings.adaSymbol}
                />
              ) : displayInfo.extra.length ? (
                <Text fontSize={12} fontWeight="semibold" color="teal.500">
                  {getTxExtra(displayInfo.extra)}
                </Text>
              ) : (
                ''
              )}
              {!['internalIn', 'externalIn'].includes(displayInfo.type) ? (
                <Box flexDirection="row" fontSize={12}>
                  Fee:{' '}
                  <UnitDisplay
                    display="inline-block"
                    quantity={displayInfo.detail.info.fees}
                    decimals={6}
                    symbol={settings.adaSymbol}
                  />
                  {parseInt(displayInfo.detail.info.deposit) ? (
                    <>
                      {parseInt(displayInfo.detail.info.deposit) > 0
                        ? ' & Deposit: '
                        : ' & Refund: '}
                      <UnitDisplay
                        display="inline-block"
                        quantity={
                          parseInt(displayInfo.detail.info.deposit) > 0
                            ? displayInfo.detail.info.deposit
                            : parseInt(displayInfo.detail.info.deposit) * -1
                        }
                        decimals={6}
                        symbol={settings.adaSymbol}
                      />
                    </>
                  ) : (
                    ''
                  )}
                </Box>
              ) : (
                ''
              )}

              {displayInfo.assets.length > 0 ? (
                <Box flexDirection="row" fontSize={12}>
                  <Text
                    display="inline-block"
                    fontWeight="bold"
                    _hover={{ backgroundColor: colorMode.assetsBtnHover }}
                    borderRadius="md"
                  >
                    <AssetsPopover assets={displayInfo.assets} isDifference />
                  </Text>
                </Box>
              ) : (
                ''
              )}
            </Box>
            <AccordionIcon color="teal.400" mr={5} fontSize={20} />
          </AccordionButton>
        ) : (
          <Skeleton width="100%" height="72px" rounded="md" />
        )}
        <AccordionPanel wordBreak="break-word" pb={4}>
          {displayInfo && (
            <TxDetail displayInfo={displayInfo} network={network} />
          )}
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
    unstake: IoRemoveCircleSharp,
    poolUpdate: FaRegEdit,
    poolRetire: FaTrashAlt,
    mint: GiAnvilImpact,
    multisig: FaUsers,
    contract: FaRegFileCode,
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

const TxDetail = ({ displayInfo, network }) => {
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
              href={
                (() => {
                  switch (network.id) {
                    case NETWORK_ID.mainnet:
                      return 'https://cardanoscan.io/transaction/';
                    case NETWORK_ID.preprod:
                      return 'https://testnet.cardanoscan.io/transaction/';
                    case NETWORK_ID.preview:
                      return 'https://preview.cexplorer.io/tx/';
                    case NETWORK_ID.testnet:
                      return 'https://testnet.cexplorer.io/tx/';
                  }
                })() + displayInfo.txHash
              }
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

const genDisplayInfo = (txHash, detail, currentAddr, addresses) => {
  if (!detail || !detail.info || !detail.utxos || !detail.block) {
    return null;
  }

  const type = getTxType(currentAddr, addresses, detail.utxos);
  const date = dateFromUnix(detail.block.time);
  const amounts = calculateAmount(
    currentAddr,
    detail.utxos,
    detail.info.valid_contract
  );
  const assets = amounts.filter((amount) => amount.unit !== 'lovelace');
  const lovelace = BigInt(
    amounts.find((amount) => amount.unit === 'lovelace').quantity
  );

  return {
    txHash: txHash,
    detail: detail,
    date: date,
    timestamp: getTimestamp(date),
    type: type,
    extra: getExtra(detail.info, type),
    amounts: amounts,
    lovelace: ['internalIn', 'externalIn', 'multisig'].includes(type)
      ? lovelace
      : lovelace +
        BigInt(detail.info.fees) +
        (parseInt(detail.info.deposit) > 0
          ? BigInt(detail.info.deposit)
          : BigInt(0)),
    assets: assets.map((asset) => {
      const _policy = asset.unit.slice(0, 56);
      const _name = asset.unit.slice(56);
      const fingerprint = new AssetFingerprint(
        Buffer.from(_policy, 'hex'),
        Buffer.from(_name, 'hex')
      ).fingerprint();

      return {
        unit: asset.unit,
        quantity: asset.quantity,
        policy: _policy,
        name: hexToAscii(_name),
        fingerprint,
      };
    }),
  };
};

const getTxType = (currentAddr, addresses, uTxOList) => {
  let inputsAddr = uTxOList.inputs.map((utxo) => utxo.address);
  let outputsAddr = uTxOList.outputs.map((utxo) => utxo.address);

  if (inputsAddr.every((addr) => addr === currentAddr)) {
    // sender
    return outputsAddr.every((addr) => addr === currentAddr)
      ? 'self'
      : outputsAddr.some(
          (addr) => addresses.includes(addr) && addr !== currentAddr
        )
      ? 'internalOut'
      : 'externalOut';
  } else if (inputsAddr.every((addr) => addr !== currentAddr)) {
    // receiver
    return inputsAddr.some((addr) => addresses.includes(addr))
      ? 'internalIn'
      : 'externalIn';
  }
  // multisig
  return 'multisig';
};

const dateFromUnix = (unixTimestamp) => {
  return new Date(unixTimestamp * 1000);
};

const getTimestamp = (date) => {
  const zeroLead = (str) => ('0' + str).slice(-2);

  return `${date.getFullYear()}-${zeroLead(date.getMonth() + 1)}-${zeroLead(
    date.getDate()
  )} ${zeroLead(date.getHours())}:${zeroLead(date.getMinutes())}:${zeroLead(
    date.getSeconds()
  )}`;
};

const calculateAmount = (currentAddr, uTxOList, validContract = true) => {
  let inputs = compileOutputs(
    uTxOList.inputs.filter(
      (input) =>
        input.address === currentAddr && !(input.collateral && validContract)
    )
  );
  let outputs = compileOutputs(
    uTxOList.outputs.filter(
      (output) =>
        output.address === currentAddr && !(output.collateral && validContract)
    )
  );
  let amounts = [];

  while (inputs.length) {
    let input = inputs.pop();
    let outputIndex = outputs.findIndex((amount) => amount.unit === input.unit);
    let qty;

    if (outputIndex > -1) {
      qty =
        (BigInt(input.quantity) - BigInt(outputs[outputIndex].quantity)) *
        BigInt(-1);
      outputs.splice(outputIndex, 1);
    } else {
      qty = BigInt(input.quantity) * BigInt(-1);
    }

    if (qty !== BigInt(0) || input.unit === 'lovelace')
      amounts.push({
        unit: input.unit,
        quantity: qty,
      });
  }

  return amounts.concat(outputs);
};

const getExtra = (info, txType) => {
  let extra = [];
  if (info.redeemer_count) {
    extra.push('contract');
  } else if (txType === 'multisig') {
    extra.push('multisig');
  }
  if (info.withdrawal_count && txType === 'self')
    extra.push('withdrawal');
  if (info.delegation_count) extra.push('delegation');
  if (info.asset_mint_or_burn_count) extra.push('mint');
  if (info.stake_cert_count && parseInt(info.deposit) >= 0) extra.push('stake');
  if (info.stake_cert_count && parseInt(info.deposit) < 0)
    extra.push('unstake');
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
          {JSON.stringify(
            metadata.map((m) => ({ [m.label]: m.json_metadata })),
            null,
            2
          )}
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
