import { Box, Text, Spinner, Accordion, Button } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import React from 'react';
import { File } from 'react-kawaii';
import {
  getTransactions,
  setTransactions,
  setTxDetail,
} from '../../../api/extension';
import Transaction from './transaction';
import { useCaptureEvent } from '../../../features/analytics/hooks';
import { Events } from '../../../features/analytics/events';

const BATCH = 5;

let slice = [];

let txObject = {};

const HistoryViewer = ({ history, network, currentAddr, addresses }) => {
  const capture = useCaptureEvent();
  const [historySlice, setHistorySlice] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const [final, setFinal] = React.useState(false);
  const [loadNext, setLoadNext] = React.useState(false);

  const getBitcoinTx = (txHash, chain, amount, blockTime = 1727431131) => {
    return {
      block: {
        confirmations: 0,
        hash: txHash,
        height: 2522850,
        time: blockTime,
      },
      info: {
        chain: chain,
        block:
          '016ea9f25fbd19e1fc777eb1211d00d756cf51d40f3b0aa3dbae9309f1bfad51',
        block_height: 2522850,
        block_time: blockTime,
        deposit: '0',
        fees: '200000',
        hash: txHash,
        output_amount: [
          {
            quantity: '2000000000',
            unit: 'lovelace',
          },
        ],
      },
      metadata: [],
      utxos: {
        hash: txHash,
        inputs: [
          {
            address:
              'addr_test1vqeux7xwusdju9dvsj8h7mca9aup2k439kfmwy773xxc2hcu7zy99',
            amount: [
              {
                quantity: '13000200000',
                unit: 'lovelace',
              },
            ],
          },
        ],
        outputs: [
          {
            address: currentAddr,
            amount: [
              {
                quantity: amount,
                unit: 'lovelace',
              },
            ],
          },
        ],
      },
    };
  };

  const getTxs = async () => {
    if (!history) {
      slice = [];
      setHistorySlice(null);
      setPage(1);
      setFinal(false);
      return;
    }
    await new Promise((res, rej) => setTimeout(() => res(), 10));
    slice = slice.concat(
      history.confirmed.slice((page - 1) * BATCH, page * BATCH)
    );

    if (slice.length < page * BATCH) {
      let txs = await getTransactions(page, BATCH);

      txs = txs.concat([
        {
          txHash:
            '9b151508940dbdb104d6811d79ca1407e8eb3004c651b63b2b9f3250a79aaa10',
          txIndex: 0,
          blockHeight: 2522850,
        },
        {
          txHash:
            '52014d1f6f16f60306c25526ff79d375ec2cdfcfb406a876065229f0014d68b0',
          txIndex: 0,
          blockHeight: 2522850,
        },
      ]);

      if (txs.length <= 0) {
        setFinal(true);
      } else {
        slice = Array.from(new Set(slice.concat(txs.map((tx) => tx.txHash))));
        await setTransactions(slice);
      }
    }
    if (slice.length < page * BATCH) setFinal(true);
    setHistorySlice(slice);
  };

  React.useEffect(() => {
    getTxs();
  }, [history, page]);

  React.useEffect(() => {
    const storeTx = setInterval(() => {
      if (Object.keys(txObject).length <= 0) return;
      setTimeout(() => setTxDetail(txObject));
    }, 1000);
    return () => {
      slice = [];
      setHistorySlice(null);
      setPage(1);
      setFinal(false);
      clearInterval(storeTx);
    };
  }, []);

  React.useEffect(() => {
    if (!historySlice) return;
    if (historySlice.length >= (page - 1) * BATCH) setLoadNext(false);
  }, [historySlice]);

  return (
    <Box position="relative">
      {!(history && historySlice) ? (
        <HistorySpinner />
      ) : historySlice.length <= 0 ? (
        <Box
          mt="16"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          opacity="0.5"
        >
          <File size={80} mood="ko" color="#61DDBC" />
          <Box height="2" />
          <Text fontWeight="bold" color="GrayText">
            No History
          </Text>
        </Box>
      ) : (
        <>
          <Accordion
            allowToggle
            borderBottom="none"
            onClick={() => {
              capture(Events.ActivityActivityActivityRowClick);
            }}
          >
            {historySlice.map((txHash, index) => {
              // console.log('history.details[txHash]', history.details[txHash]);
              if (!history.details[txHash]) history.details[txHash] = {};

              console.log('history.details[txHash] ', history.details[txHash]);
              switch (txHash) {
                case '9b151508940dbdb104d6811d79ca1407e8eb3004c651b63b2b9f3250a79aaa10':
                  history.details[txHash] = getBitcoinTx(
                    txHash,
                    'bitcoin',
                    14300000,
                    1727231131
                  );
                  break;
                case '52014d1f6f16f60306c25526ff79d375ec2cdfcfb406a876065229f0014d68b0':
                  history.details[txHash] = getBitcoinTx(
                    txHash,
                    'dogecoin',
                    500000000,
                    1726431131
                  );
                  break;
                default:
                  break;
              }

              return (
                <Transaction
                  onLoad={(txHash, txDetail) => {
                    txObject[txHash] = txDetail;
                  }}
                  key={index}
                  txHash={txHash}
                  detail={history.details[txHash]}
                  currentAddr={currentAddr}
                  addresses={addresses}
                  network={network}
                  chain={history.details[txHash]?.info?.chain}
                />
              );
            })}
          </Accordion>
          {final ? (
            <Box
              textAlign="center"
              // mt={18}
              fontSize={16}
              fontWeight="bold"
              color="gray.400"
            >
              ... nothing more
            </Box>
          ) : (
            <Box textAlign="center">
              <Button
                variant="outline"
                onClick={() => {
                  setLoadNext(true);
                  setTimeout(() => setPage(page + 1));
                }}
                colorScheme="orange"
                aria-label="More"
                fontSize={20}
                w="50%"
                h="30px"
                rounded="xl"
              >
                {loadNext ? '...' : <ChevronDownIcon fontSize="30px" />}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

const HistorySpinner = () => (
  <Box mt="28" display="flex" alignItems="center" justifyContent="center">
    <Spinner color="teal" speed="0.5s" />
  </Box>
);

export default HistoryViewer;
