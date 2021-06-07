import { Box, SimpleGrid, Stack } from '@chakra-ui/layout';
import {
  Avatar,
  Button,
  Image,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { getNetwork } from '../../../api/extension';
import provider from '../../../config/provider';

const AssetBadge = ({ asset }) => {
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
      flexDirection="column"
      width="full"
      height="full"
      rounded="full"
      border="solid 2px"
      borderColor="teal.400"
      p="1"
    >
      <Stack direction="row" alignItems="center" justifyContent="center">
        <Image
          width="1"
          height="1"
          src={token && token.image}
          fallback={<Avatar size="xs" name="SpaceBud #123" />}
        />
        <Input placeholder="Qty" size="xs" width="50px" variant="unstyled" />
      </Stack>
    </Box>
  );
};

export default AssetBadge;
