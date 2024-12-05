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

let pending_slice = [];
let slice = [];

let txObject = {};

const HistoryViewer = ({ history, network, currentAddr, addresses }) => {
  const capture = useCaptureEvent();
  const [pendingHistorySlice, setPendingHistorySlice] = React.useState(null);
  const [historySlice, setHistorySlice] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const [pendingPage, setPendingPage] = React.useState(1);
  const [memLoaded, setMemLoaded] = React.useState(false);
  const [final, setFinal] = React.useState(false);
  const [loadNext, setLoadNext] = React.useState(false);

  const getTxs = async () => {
    if (!history) {
      pending_slice = [];
      slice = [];
      setPendingHistorySlice(null);
      setHistorySlice(null);
      setPage(1);
      setPendingPage(1);
      setFinal(false);
      setMemLoaded(false);
      return;
    }
    await new Promise((res) => setTimeout(() => res(), 10));

    if (!memLoaded && pending_slice.length < pendingPage * BATCH) {
      const txs = await getTransactions(pendingPage, BATCH, !memLoaded);
      if (txs.length <= 0) {
        setMemLoaded(true);
      } else {
        pending_slice = Array.from(new Set(pending_slice.concat(txs.map((tx) => tx.txHash))));
        await setTransactions(pending_slice, true);
      }
    }
    if (memLoaded && slice.length < page * BATCH) {
      const txs = await getTransactions(page, BATCH, !memLoaded);
      if (txs.length <= 0) {
        setFinal(true);
      } else {
        slice = Array.from(new Set(slice.concat(txs.map((tx) => tx.txHash))));
        await setTransactions(slice, false);
      }
    }
    setPendingHistorySlice(pending_slice);
    setHistorySlice(slice);
  };

  React.useEffect(() => {
    getTxs();
  }, [history, page, pendingPage, memLoaded]);

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

  let content;
  if (!(history && historySlice)) {
    content = <HistorySpinner />;
  } else if (historySlice.length <= 0 && pendingHistorySlice.length <= 0) {
    content = (
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
    );
  } else {
    content = (
      <>
        <Accordion
          allowToggle
          borderBottom="none"
          onClick={() => {
            capture(Events.ActivityActivityActivityRowClick);
          }}
        >
          {pendingHistorySlice.map((txHash) => {
            if (!history.details[txHash]) history.details[txHash] = {};
            return (
              <Transaction
                onLoad={(hash, txDetail) => {
                  history.details[hash] = txDetail;
                  txObject[hash] = txDetail;
                }}
                key={txHash}
                txHash={txHash}
                detail={history.details[txHash]}
                currentAddr={currentAddr}
                addresses={addresses}
                network={network}
                pending
              />
            );
          })}
          {historySlice.map((txHash) => {
            if (!history.details[txHash]) history.details[txHash] = {};
            return (
              <Transaction
                onLoad={(hash, txDetail) => {
                  history.details[hash] = txDetail;
                  txObject[hash] = txDetail;
                }}
                key={txHash}
                txHash={txHash}
                detail={history.details[txHash]}
                currentAddr={currentAddr}
                addresses={addresses}
                network={network}
                pending={false}
              />
            );
          })}
        </Accordion>
        {final ? (
          <Box
            textAlign="center"
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
                setTimeout(
                  memLoaded ? () => setPage(page + 1) : () => setPendingPage(pendingPage + 1)
                );
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
    );
  }

  return <Box position="relative">{content}</Box>;
};

const HistorySpinner = () => (
  <Box mt="28" display="flex" alignItems="center" justifyContent="center">
    <Spinner color="teal" speed="0.5s" />
  </Box>
);

export default HistoryViewer;