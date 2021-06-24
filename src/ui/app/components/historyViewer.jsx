import { Box, Text } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/spinner';
import { Accordion } from '@chakra-ui/react';
import React from 'react';
import { File } from 'react-kawaii';
import { getTransactions } from '../../../api/extension';
import Transaction from './transaction';

const HistoryViewer = ({ history, currentAddr, addresses }) => {
  const [historySlice, setHistorySlice] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const [final, setFinal] = React.useState(false);
  const getTxs = async () => {
    if (!history) {
      setHistorySlice(null);
      return;
    }

    let slice = history.confirmed.slice(0, page * 10);

    if (slice.length < page * 10) {
      const txs = await getTransactions(page);

      if (txs.length <= 0) {
        setFinal(true);
      } else {
        slice = Array.from(new Set(slice.concat(txs.map((tx) => tx.txHash))));
      }
    }
    setHistorySlice(slice);
  };

  React.useEffect(() => {
    getTxs();
  }, [history]);
  return (
    <Box position="relative">
      {!historySlice || !history ? (
        <Box mt="28" display="flex" alignItems="center" justifyContent="center">
          <Spinner color="teal" speed="0.5s" />
        </Box>
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
        <Accordion allowToggle>
          {historySlice.map((txHash) => (
            <Transaction
              key={txHash}
              txHash={txHash}
              details={history && history.details}
              currentAddr={currentAddr}
              addresses={addresses}
            />
          ))}
        </Accordion>
      )}
    </Box>
  );
};

export default HistoryViewer;
