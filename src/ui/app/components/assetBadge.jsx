import { CloseIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { Box, SimpleGrid, Stack } from '@chakra-ui/layout';
import {
  Avatar,
  Button,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Skeleton,
  SkeletonCircle,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { getNetwork, toUnit } from '../../../api/extension';
import { blockfrostRequest } from '../../../api/util';
import provider from '../../../config/provider';

const AssetBadge = ({ asset, onRemove, onInput, onLoad }) => {
  const [initialWidth, setInitialWidth] = React.useState(
    BigInt(asset.quantity) <= 1 ? 60 : 85
  );
  const [load, setLoad] = React.useState(true);
  const [width, setWidth] = React.useState(initialWidth);
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
    if (asset && asset.loaded) return;
    const result = await blockfrostRequest(`/assets/${asset.unit}`);
    console.log(result);
    const name =
      (result.onchain_metadata && result.onchain_metadata.name) ||
      (result.metadata && result.metadata.name) ||
      asset.name;
    const image =
      (result.onchain_metadata && linkToHttps(result.onchain_metadata.image)) ||
      (result.metadata && result.metadata.logo) ||
      '';
    onLoad({ displayName: name, image });
    setLoad(false);
  };

  React.useEffect(() => {
    fetchMetadata();
    const initialWidth = BigInt(asset.quantity) <= 1 ? 60 : 85;
    setInitialWidth(initialWidth);
    setWidth(initialWidth);
    if (BigInt(asset.quantity) <= 1) onInput(asset.quantity);
  }, [asset]);
  return (
    <Box m="0.5">
      <InputGroup size="sm">
        <InputLeftElement
          rounded="lg"
          pointerEvents="none"
          children={
            <Box
              userSelect="none"
              width="6"
              height="6"
              rounded="full"
              overflow="hidden"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {load ? (
                <SkeletonCircle size="5" />
              ) : (
                <Image
                  src={asset.image}
                  fallback={
                    asset.image ? (
                      <SkeletonCircle size="5" />
                    ) : (
                      <Avatar size="xs" name={asset.name} />
                    )
                  }
                />
              )}
            </Box>
          }
        />
        <Input
          width={`${width}px`}
          maxWidth="130px"
          isReadOnly={BigInt(asset.quantity) <= 1}
          value={asset.input || ''}
          fontSize="xs"
          rounded="lg"
          placeholder="Qty"
          onInput={(e) => {
            setWidth(initialWidth + e.target.value.length * 4);
            onInput(e.target.value);
          }}
          isInvalid={
            asset.input &&
            (BigInt(toUnit(asset.input, 0)) > BigInt(asset.quantity) ||
              BigInt(toUnit(asset.input, 0)) <= 0)
          }
        />
        <InputRightElement
          rounded="lg"
          children={
            <SmallCloseIcon cursor="pointer" onClick={() => onRemove()} />
          }
        />
      </InputGroup>
    </Box>
  );
};

export default AssetBadge;
