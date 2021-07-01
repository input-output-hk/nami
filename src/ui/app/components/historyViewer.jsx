import { Box, Text } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/spinner';
import { Accordion, Button } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import React from 'react';
import { File } from 'react-kawaii';
import { getTransactions } from '../../../api/extension';
import Transaction from './transaction';

const HistoryViewer = ({ history, currentAddr, addresses }) => {
  const [historySlice, setHistorySlice] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [final, setFinal] = React.useState(false);
  const getTxs = async () => {
    if (!history) {
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
  }, [history, page]);
  return (
    <Box position="relative">
      {!history ? (
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
          <Accordion allowToggle borderBottom="none">
            {historySlice.map((txHash) => {
              if (!history.details[txHash]) history.details[txHash] = {};

              return (
                <Transaction
                  key={txHash}
                  txHash={txHash}
                  detail={history.details[txHash]}
                  currentAddr={currentAddr}
                  addresses={addresses}
                />
              );
            })}
          </Accordion>
          {historySlice.length % 10 !== 0 || final ? (
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
                onClick={() => setPage(page + 1)}
                colorScheme="orange"
                aria-label="More"
                fontSize={20}
                w="50%"
                h="30px"
                rounded="xl"
                shadow="md"
              >
                <ChevronDownIcon fontSize="30px" />
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
