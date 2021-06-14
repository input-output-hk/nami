import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Link } from '@chakra-ui/layout';
import React from 'react';
import { getNetwork } from '../../../api/extension';
import { NETWORK_ID } from '../../../config/config';

const Transaction = ({ txHash }) => {
  const [url, setUrl] = React.useState('');
  React.useEffect(() => {
    getNetwork().then((network) =>
      network.id === NETWORK_ID.mainnet
        ? setUrl('https://cardanoscan.io/transaction/')
        : setUrl(
            'https://explorer.cardano-testnet.iohkdev.io/en/transaction?id='
          )
    );
  }, []);
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
          href={url + txHash}
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
