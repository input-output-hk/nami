import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Link } from '@chakra-ui/layout';
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
} from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/spinner';
import CoinSelection from '../../../lib/coinSelection';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import ReactTimeAgo from 'react-time-ago';
import { TiArrowForward, TiArrowBack, TiArrowShuffle } from 'react-icons/ti';
TimeAgo.addDefaultLocale(en);

const Transaction = ({ txHash, details, currentAddr, addresses }) => {
  let detail = details[txHash];
  const [displayInfo, setDisplayInfo] = React.useState({});

  const getTxDetail = async () => {
    if (!details) {
      return;
    }

    if (!detail) {
      detail = details[txHash] = {};
      await updateTxInfo(txHash, detail);
      setDisplayInfo(genDisplayInfo(detail, currentAddr, addresses));
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
        <VStack spacing={4}>
          <Box align="center" fontSize={16} fontWeight={500} color="gray.500">
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
            bg="teal.50"
            borderRadius={10}
            borderLeftRadius={30}
            p={0}
            _hover={{ backgroundColor: 'teal.100' }}
            _focus={{ border: 'none' }}
          >
            <Box
              display="flex"
              flexShrink={5}
              p={8}
              borderRadius={50}
              bg="white"
              position="relative"
              left="-25px"
            >
              <TxIcon txType={displayInfo.type} />
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              textAlign="center"
              position="relative"
              left="-25px"
            >
              <Box fontSize={20}>
                <UnitDisplay
                  quantity={displayInfo.amount[0].quantity}
                  decimals={6}
                  symbol="₳"
                />
              </Box>
              <Box flexDirection="row" fontSize={12}>
                Fees:{' '}
                <UnitDisplay
                  display="inline-block"
                  quantity={detail.info.fees}
                  decimals={6}
                  symbol="₳"
                />
              </Box>
              {displayInfo.amount.length > 1 ? (
                <Box flexDirection="row" fontSize={12}>
                  <strong>
                    + {displayInfo.amount.length - 1} Asset
                    {displayInfo.amount.length > 2 ? 's' : ''}
                  </strong>
                </Box>
              ) : (
                ''
              )}
            </Box>
            <AccordionIcon color="teal.400" mr={5} fontSize={30} />
          </AccordionButton>

          <AccordionPanel wordBreak="break-word" pb={4}>
            <p>{txHash}</p>
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
              mb={6}
            ></Box>
          </Box>
        </VStack>
      )}
    </AccordionItem>
  );
};

const genDisplayInfo = (detail, currentAddr, addresses) => {
  if (!detail.info || !detail.utxos) return;

  const type = getTxType(currentAddr, addresses, detail.utxos);
  const date = dateFromUnix(detail.block.time);

  return {
    date: date,
    formatDate: formatDate(date),
    type: type,
    amount: calculateAmount(type, currentAddr, detail.utxos),
  };
};

const getTxType = (currentAddr, addresses, uTxOList) => {
  let inputsAddr = uTxOList.inputs.map((utxo) => utxo.address);
  let outputsAddr = uTxOList.outputs.map((utxo) => utxo.address);

  return inputsAddr.includes(currentAddr)
    ? outputsAddr.some(
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

const formatDate = (date) => {
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

const TxIcon = ({ txType }) => {
  const icons = {
    internalIn: TiArrowShuffle,
    externalIn: TiArrowForward,
    internalOut: TiArrowShuffle,
    externalOut: TiArrowBack,
  };
  const color = {
    internalIn: 'teal.400',
    externalIn: 'teal.400',
    internalOut: 'orange.500',
    externalOut: 'orange.500',
  };

  const style =
    txType === 'externalIn'
      ? { transform: 'rotate(90deg)' }
      : txType === 'internalOut'
      ? { transform: 'rotate(180deg)' }
      : '';

  return (
    <Icon as={icons[txType]} style={style} w={8} h={8} color={color[txType]} />
  );
};

export default Transaction;
