import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Link } from '@chakra-ui/layout';
import React from 'react';

const Transaction = ({ txHash }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="full"
      height="16"
      rounded="xl"
      shadow="md"
      wordBreak="break-all"
    >
      <Box width="90%" isTruncated={true}>
        <b>TxHash:</b>{' '}
        <Link
          href={`https://cardanoscan.io/transaction/${txHash}`}
          isExternal
          color="teal.500"
          style={{ fontSize: 9 }}
        >
          {txHash}
        </Link>
      </Box>
    </Box>
  );
};

export default Transaction;
