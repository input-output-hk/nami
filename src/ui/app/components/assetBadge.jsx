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
import { isIPFS } from 'ipfs';
import React from 'react';
import { toUnit } from '../../../api/extension';
import {
  blockfrostRequest,
  convertMetadataPropToString,
  linkToSrc,
} from '../../../api/util';
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
  const [width, setWidth] = React.useState(initialWidth);
  const [token, setToken] = React.useState(null);

  const fetchMetadata = async () => {
    if (asset && asset.loaded) {
      onLoad({ ...asset });
      setToken({ ...asset });
      return;
    }
    const result = await blockfrostRequest(`/assets/${asset.unit}`);
    const name =
      (result.onchain_metadata && result.onchain_metadata.name) ||
      (result.metadata && result.metadata.name) ||
      asset.name;
    let image =
      (result.onchain_metadata &&
        result.onchain_metadata.image &&
        linkToSrc(
          convertMetadataPropToString(result.onchain_metadata.image)
        )) ||
      (result.metadata && linkToSrc(result.metadata.logo)) ||
      '';

    setToken({ displayName: name, ...asset, image: 'loading' });

    // Will be enabled again when ipfs-js is more reliable to use
    // if (image && isIPFS.multihash(image)) {
    //   const port = chrome.runtime.connect({
    //     name: 'IPFS-' + asset.unit,
    //   });
    //   port.postMessage({
    //     hash: image,
    //   });
    //   image = await new Promise((res, rej) =>
    //     port.onMessage.addListener(function listener(url) {
    //       port.onMessage.removeListener(listener);
    //       res(url);
    //       return;
    //     })
    //   );
    // }
    onLoad({ displayName: name, image });
    if (!isMounted.current) return;
    setToken((t) => ({
      ...t,
      image,
    }));
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
              {!token ? (
                <SkeletonCircle size="5" />
              ) : (
                <AssetPopover asset={token}>
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
                      width="full"
                      rounded="sm"
                      src={token.image}
                      fallback={
                        !token.image ? (
                          <Avatar size="xs" name={token.name} />
                        ) : (
                          <Fallback name={token.name} />
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
          rounded="xl"
          variant="filled"
          fontSize="xs"
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

const Fallback = ({ name }) => {
  const [timedOut, setTimedOut] = React.useState(false);
  React.useEffect(() => {
    setTimeout(() => setTimedOut(true), 30000);
  }, []);
  if (timedOut) return <Avatar size="xs" name={name} />;
  return <SkeletonCircle size="5" />;
};

export default AssetBadge;
