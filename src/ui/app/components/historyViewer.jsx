import { Box, Text } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/spinner';
import React from 'react';
import { File } from 'react-kawaii';
import { getTransactions } from '../../../api/extension';
import Transaction from './transaction';

const HistoryViewer = ({ account }) => {
  const [historySlice, setHistorySlice] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const [final, setFinal] = React.useState(false);

  const getTxs = async () => {
    if (!account) {
      setHistorySlice(null);
      return;
    }
    let slice = account.history.confirmed.slice(0, page * 10);
    if (slice.length < page * 10) {
      const txs = await getTransactions(page);
      if (txs.length <= 0) {
        setFinal(true);
      } else {
        slice = Array.from(new Set(slice.concat(txs)));
      }
    }
    setHistorySlice(slice);
  };

  React.useEffect(() => {
    getTxs();
  }, [account]);
  return (
    <Box position="relative">
      {!historySlice ? (
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
        <Box display="flex" alignItems="center" justifyContent="center">
          <Box width="80%">
            {historySlice.map((txHash) => (
              <>
                {' '}
                <Transaction txHash={txHash} />
                <Box height="4" />
              </>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default HistoryViewer;
