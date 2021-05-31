import { Box, SimpleGrid, Stack } from '@chakra-ui/layout';
import {
  Avatar,
  Button,
  Image,
  Skeleton,
  SkeletonCircle,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { getNetwork } from '../../../api/extension';
import provider from '../../../config/provider';

import './lineClamp.css';

const Asset = ({ asset }) => {
  const [token, setToken] = React.useState(null);
  const linkToHttps = (link) => {
    if (link.startsWith('https://')) return link;
    else if (link.startsWith('ipfs://'))
      return (
        provider.api.ipfs +
        '/' +
        link.split('ipfs://')[1].split('ipfs/').slice(-1)[0]
      );
    return false;
  };

  const hexToAscii = (hex) => {
    var _hex = hex.toString();
    var str = '';
    for (var i = 0; i < _hex.length && _hex.substr(i, 2) !== '00'; i += 2)
      str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
    return str;
  };

  const fetchMetadata = async () => {
    const network = await getNetwork();
    const result = await fetch(
      provider.api.base(network) + `/assets/${asset.unit}`,
      {
        headers: provider.api.key(network),
      }
    ).then((res) => res.json());
    console.log(result);
    const name =
      (result.onchain_metadata && result.onchain_metadata.name) ||
      (result.metadata && result.metadata.name) ||
      hexToAscii(result.asset_name);
    const image =
      (result.onchain_metadata && linkToHttps(result.onchain_metadata.image)) ||
      (result.metadata && result.metadata.logo) ||
      '';

    setToken({ name, image, quantity: asset.quantity });
  };

  React.useEffect(() => {
    fetchMetadata();
  }, [asset]);
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      width="full"
      height="full"
    >
      <Box
        rounded="lg"
        overflow="hidden"
        width="16"
        height="20"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        userSelect="none"
      >
        {!token ? (
          <SkeletonCircle size="14" />
        ) : !token.image ? (
          <Avatar name={token.name} />
        ) : (
          <Image
            width="full"
            rounded="md"
            src={token.image}
            fallback={<SkeletonCircle size="14" />}
          />
        )}
      </Box>
      <Box
        width="74px"
        height="40px"
        display="flex"
        alignItems="center"
        flexDirection="column"
        justifyContent="center"
      >
        {!token ? (
          <Skeleton height="16px" width="80%" />
        ) : (
          <>
            <Text fontSize="9" textAlign="center">
              {token.quantity}
            </Text>
            {/* <Box height="1" /> */}
            <Text
              className="lineClamp"
              overflow="hidden"
              height="40px"
              maxWidth="74px"
              fontWeight="semibold"
              color="GrayText"
              lineHeight="1.1"
              textAlign="center"
            >
              {token.name}
            </Text>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Asset;
