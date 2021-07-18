import { SmallCloseIcon } from '@chakra-ui/icons';
import { Box } from '@chakra-ui/layout';
import {
  Avatar,
  Button,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  SkeletonCircle,
} from '@chakra-ui/react';
import React from 'react';
import { toUnit } from '../../../api/extension';
import { blockfrostRequest, linkToSrc } from '../../../api/util';
import AssetPopover from './assetPopover';

const useIsMounted = () => {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);
  return isMounted;
};

const AssetBadge = ({ asset, onRemove, onInput, onLoad }) => {
  const isMounted = useIsMounted();
  const [initialWidth, setInitialWidth] = React.useState(
    BigInt(asset.quantity) <= 1 ? 60 : 85
  );
  const [load, setLoad] = React.useState(true);
  const [width, setWidth] = React.useState(initialWidth);

  const fetchMetadata = async () => {
    if (asset && asset.loaded) return;
    const result = await blockfrostRequest(`/assets/${asset.unit}`);
    const name =
      (result.onchain_metadata && result.onchain_metadata.name) ||
      (result.metadata && result.metadata.name) ||
      asset.name;
    let image =
      (result.onchain_metadata &&
        result.onchain_metadata.image &&
        linkToSrc(result.onchain_metadata.image)) ||
      (result.metadata && linkToSrc(result.metadata.logo)) ||
      '';
    if (!isMounted.current) return;
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
                <AssetPopover asset={asset}>
                  <Button
                    style={{
                      all: 'revert',
                      margin: 0,
                      padding: 0,
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
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
                  </Button>
                </AssetPopover>
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
            if (!e.target.value.match(/^\d*[0-9]\d*$/) && e.target.value)
              return;
            // if (!e.target.value.match(/^\d*[0-9,.]\d*$/) && e.target.value) return; -- decimals not supported yet for assets
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
