import { Box } from '@chakra-ui/layout';
import {
  Avatar,
  Image,
  Skeleton,
  Text,
  useColorModeValue,
  Button,
  Collapse,
} from '@chakra-ui/react';
import React from 'react';
import {
  blockfrostRequest,
  convertMetadataPropToString,
  linkToSrc,
} from '../../../api/util';
import AssetPopover from './assetPopover';
import Copy from './copy';
import UnitDisplay from './unitDisplay';

const useIsMounted = () => {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);
  return isMounted;
};

const Asset = ({ asset, onLoad, storedAssets, port }) => {
  const isMounted = useIsMounted();
  const [token, setToken] = React.useState(null);
  const background = useColorModeValue('gray.100', 'gray.700');
  const [show, setShow] = React.useState(false);

  const fetchMetadata = async () => {
    if (storedAssets[asset.unit]) {
      setToken({ ...storedAssets[asset.unit], quantity: asset.quantity });
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
      (result.metadata && linkToSrc(result.metadata.logo, true)) ||
      '';
    setToken({ displayName: name, ...asset, image });

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
    onLoad({
      displayName: name,
      image,
      ...asset,
    });
    if (!isMounted.current) return;
    setToken((t) => ({
      ...t,
      image,
    }));
  };

  React.useEffect(() => {
    fetchMetadata();
  }, [asset]);
  return !token ? (
    <Skeleton width="90%" height="70px" rounded="xl" />
  ) : (
    <Box
      display="flex"
      alignItems="center"
      width="90%"
      rounded="xl"
      background={background}
      onClick={() => setShow(!show)}
      cursor="pointer"
      overflow="hidden"
    >
      <Collapse startingHeight={60} in={show} style={{ width: '100%' }}>
        <Box
          width="100%"
          height="60px"
          display="flex"
          alignItems="center"
          px={4}
        >
          <Box width="50px" height="50px" rounded="full" overflow="hidden">
            <Image
              draggable={false}
              width="full"
              src={token.image}
              fallback={
                !token.image ? (
                  <Avatar width="full" height="full" name={token.name} />
                ) : (
                  <Fallback name={token.name} />
                )
              }
            />
          </Box>

          <Box w={4} />
          <Box
            width="90px"
            className="lineClamp"
            fontWeight="bold"
            overflow="hidden"
          >
            {token.displayName}
          </Box>
          <Box w={4} />
          <Box width="120px" textAlign="center">
            <UnitDisplay quantity={token.quantity} decimals={0} />
          </Box>
        </Box>
        <Box h={4} />
        <Box px={10} display="flex" width="full" wordBreak="break-all">
          <Box width="140px" fontWeight="bold" fontSize={12}>
            Policy
          </Box>
          <Box fontSize={10} width="340px" onClick={(e) => e.stopPropagation()}>
            <Copy label="Copied policy" copy={asset.policy}>
              {asset.policy}
            </Copy>
          </Box>
        </Box>
        <Box h={4} />
        <Box px={10} display="flex" width="full" wordBreak="break-all">
          <Box width="140px" fontWeight="bold" fontSize={12}>
            Asset
          </Box>
          <Box fontSize={10} width="340px" onClick={(e) => e.stopPropagation()}>
            <Copy label="Copied asset" copy={asset.fingerprint}>
              {asset.fingerprint}
            </Copy>
          </Box>
        </Box>
        <Box h={2} />
      </Collapse>
    </Box>
  );
};

const Fallback = ({ name }) => {
  const [timedOut, setTimedOut] = React.useState(false);
  React.useEffect(() => {
    setTimeout(() => setTimedOut(true), 30000);
  }, []);
  if (timedOut) return <Avatar name={name} />;
  return <Skeleton width="full" height="full" />;
};

export default Asset;
