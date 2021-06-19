import { Box } from '@chakra-ui/layout';
import {
  Avatar,
  Image,
  Skeleton,
  SkeletonCircle,
  Text,
  Button,
} from '@chakra-ui/react';
import React from 'react';
import { blockfrostRequest } from '../../../api/util';
import provider from '../../../config/provider';
import AssetPopover from './assetPopover';

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

  const fetchMetadata = async () => {
    const result = await blockfrostRequest(`/assets/${asset.unit}`);
    const name =
      (result.onchain_metadata && result.onchain_metadata.name) ||
      (result.metadata && result.metadata.name) ||
      asset.name;
    const image =
      (result.onchain_metadata && linkToHttps(result.onchain_metadata.image)) ||
      (result.metadata && result.metadata.logo) ||
      '';

    setToken({
      displayName: name,
      image,
      ...asset,
    });
  };

  React.useEffect(() => {
    fetchMetadata();
  }, [asset]);
  return (
    <AssetPopover asset={token}>
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
          ) : (
            <Image
              width="full"
              rounded="sm"
              src={token.image}
              fallback={
                token.image ? (
                  <SkeletonCircle size="14" />
                ) : (
                  <Button
                    style={{
                      all: 'revert',
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Avatar name={token.displayName} />
                  </Button>
                )
              }
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
              <Text userSelect="text" fontSize="9" textAlign="center">
                {token.quantity}
              </Text>
              {/* <Box height="1" /> */}
              <Text
                userSelect="text"
                className="lineClamp"
                overflow="hidden"
                height="40px"
                maxWidth="74px"
                fontWeight="semibold"
                color="GrayText"
                lineHeight="1.1"
                textAlign="center"
              >
                {token.displayName}
              </Text>
            </>
          )}
        </Box>
      </Box>
    </AssetPopover>
  );
};

export default Asset;
